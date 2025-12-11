;; title: circle-treasury
;; version: 1.0.0
;; summary: Treasury contract for managing expenses and settlements within care circles
;; description: This contract handles expense creation, tracking, and settlement operations
;;              for CircleCare circles. It manages the financial flow between members
;;              and implements Clarity 4 security features for safe fund handling.

;; traits
;; Define traits for interacting with other contracts and standards

;; token definitions
;; Uses native STX for all financial operations - no custom tokens required

;; constants
;; Error codes for consistent error handling throughout the treasury operations
(define-constant ERR_UNAUTHORIZED (err u401))        ;; User lacks required permissions
(define-constant ERR_NOT_FOUND (err u404))           ;; Requested resource doesn't exist
(define-constant ERR_INVALID_INPUT (err u400))       ;; Invalid input parameters
(define-constant ERR_ALREADY_EXISTS (err u409))      ;; Resource already exists
(define-constant ERR_INSUFFICIENT_FUNDS (err u402))  ;; Not enough STX for operation
(define-constant ERR_ALREADY_SETTLED (err u410))     ;; Expense already settled
(define-constant ERR_EXPIRED (err u408))             ;; Operation or expense has expired
(define-constant ERR_INTERNAL_ERROR (err u500))      ;; Unexpected system error

;; Business logic constants
(define-constant MAX_EXPENSE_DESCRIPTION u100)       ;; Maximum characters in expense description
(define-constant MAX_PARTICIPANTS_PER_EXPENSE u20)   ;; Maximum participants in single expense
(define-constant MIN_EXPENSE_AMOUNT u1)              ;; Minimum expense amount (1 microSTX)
(define-constant MAX_EXPENSE_AMOUNT u1000000000000)  ;; Maximum expense amount (1M STX)

;; Time-based constants (in blocks)
(define-constant DEFAULT_EXPENSE_EXPIRY u144000)     ;; ~100 days in blocks (10 min/block)
(define-constant SETTLEMENT_GRACE_PERIOD u1440)     ;; ~10 days grace period

;; data vars
;; Global state variables for tracking treasury operations
(define-data-var next-expense-id uint u1)            ;; Auto-incrementing expense ID counter
(define-data-var total-expenses uint u0)             ;; Total number of expenses created
(define-data-var total-volume uint u0)               ;; Total STX volume processed
(define-data-var contract-owner principal tx-sender) ;; Contract deployer for admin functions

;; data maps
;; Core data structures for expense and settlement management

;; Main expense registry - stores all expense information
(define-map expenses uint {
  circle-id: uint,                                   ;; Which circle this expense belongs to
  amount: uint,                                      ;; Total expense amount in microSTX
  description: (string-ascii 100),                   ;; Human-readable expense description
  payer: principal,                                  ;; Who paid for this expense initially
  created-at: uint,                                  ;; Block height when expense was created
  expires-at: (optional uint),                       ;; Optional expiration block height
  settled: bool,                                     ;; Whether expense has been settled
  settled-at: (optional uint)                        ;; Block height when settled (if applicable)
})

;; Expense participants - tracks who should share each expense
(define-map expense-participants uint (list 20 principal))

;; Individual participant shares - maps (expense-id, participant) to their share info
(define-map participant-shares {expense-id: uint, participant: principal} {
  share-amount: uint,                                ;; How much this participant owes
  paid: bool,                                        ;; Whether this participant has paid their share
  paid-at: (optional uint)                           ;; When they paid (if applicable)
})

;; Circle treasury balances - tracks STX held by each circle
(define-map circle-treasuries uint {
  balance: uint,                                     ;; Current STX balance
  total-contributions: uint,                         ;; Lifetime contributions to treasury
  total-expenses: uint,                              ;; Lifetime expenses from treasury
  last-updated: uint                                 ;; Last update block height
})

;; Member balances within circles - net position of each member
(define-map member-balances {circle-id: uint, member: principal} {
  amount-owed: uint,                                 ;; Total amount member owes to circle
  amount-paid: uint,                                 ;; Total amount member has paid
  net-balance: int,                                  ;; Net balance (positive = owed money, negative = owes money)
  last-updated: uint                                 ;; Last balance update
})

;; Circle expense lists - maps circle to list of expense IDs for efficient querying
(define-map circle-expenses uint (list 100 uint))

;; public functions
;; External functions for expense and settlement operations

;; Creates a new expense within a circle
;; @param circle-id: ID of the circle for this expense
;; @param amount: Expense amount in microSTX
;; @param description: Human-readable expense description
;; @param participants: List of principals who should share this expense
;; @returns: Expense ID on success, error code on failure
(define-public (create-expense 
  (circle-id uint) 
  (amount uint) 
  (description (string-ascii 100)) 
  (participants (list 20 principal)))
  (let (
    (expense-id (var-get next-expense-id))           ;; Get next available expense ID
    (payer tx-sender)                                ;; Expense creator is the payer
    (current-block stacks-block-time)                ;; Current block timestamp
    (participant-count (len participants))           ;; Number of people sharing expense
    (share-amount (/ amount participant-count))      ;; Amount each participant owes
  )
    ;; Input validation
    (asserts! (> amount MIN_EXPENSE_AMOUNT) ERR_INVALID_INPUT)
    (asserts! (< amount MAX_EXPENSE_AMOUNT) ERR_INVALID_INPUT)
    (asserts! (> (len description) u0) ERR_INVALID_INPUT)
    (asserts! (<= (len description) MAX_EXPENSE_DESCRIPTION) ERR_INVALID_INPUT)
    (asserts! (> participant-count u0) ERR_INVALID_INPUT)
    (asserts! (<= participant-count MAX_PARTICIPANTS_PER_EXPENSE) ERR_INVALID_INPUT)
    
    ;; Verify payer is in participants list
    (asserts! (is-some (index-of participants payer)) ERR_UNAUTHORIZED)
    
    ;; TODO: Verify all participants are circle members (requires circle-factory integration)
    
    ;; Create expense record
    (map-set expenses expense-id {
      circle-id: circle-id,
      amount: amount,
      description: description,
      payer: payer,
      created-at: current-block,
      expires-at: (some (+ current-block DEFAULT_EXPENSE_EXPIRY)),
      settled: false,
      settled-at: none
    })
    
    ;; Store participants list
    (map-set expense-participants expense-id participants)
    
    ;; Initialize participant shares
    (map participants (lambda (participant)
      (map-set participant-shares {expense-id: expense-id, participant: participant} {
        share-amount: share-amount,
        paid: (is-eq participant payer),             ;; Payer is automatically marked as paid
        paid-at: (if (is-eq participant payer) (some current-block) none)
      })
      participant
    ))
    
    ;; Update circle expense list
    (map-set circle-expenses circle-id 
      (unwrap! (as-max-len? 
        (append (default-to (list) (map-get? circle-expenses circle-id)) expense-id) 
        u100) ERR_INTERNAL_ERROR))
    
    ;; Update global counters
    (var-set next-expense-id (+ expense-id u1))
    (var-set total-expenses (+ (var-get total-expenses) u1))
    (var-set total-volume (+ (var-get total-volume) amount))
    
    ;; Emit event for off-chain indexing
    (print {event: "expense-created", expense-id: expense-id, circle-id: circle-id, amount: amount, payer: payer})
    
    ;; Return success with new expense ID
    (ok expense-id)
  )
)

;; Settles an expense by processing payments from participants
;; @param expense-id: ID of the expense to settle
;; @returns: Success boolean or error code
(define-public (settle-expense (expense-id uint))
  (let (
    (expense (unwrap! (map-get? expenses expense-id) ERR_NOT_FOUND))
    (participants (unwrap! (map-get? expense-participants expense-id) ERR_NOT_FOUND))
    (current-block stacks-block-time)
  )
    ;; Verify expense exists and is not already settled
    (asserts! (not (get settled expense)) ERR_ALREADY_SETTLED)
    
    ;; Check if expense has expired
    (match (get expires-at expense)
      expiry-block (asserts! (< current-block expiry-block) ERR_EXPIRED)
      true ;; No expiry set, always valid
    )
    
    ;; Verify caller is authorized (participant or circle admin)
    (asserts! (is-some (index-of participants tx-sender)) ERR_UNAUTHORIZED)
    
    ;; Process settlement using Clarity 4's restrict-assets for security
    (restrict-assets? 
      (list {asset: 'STX, amount: (get amount expense)})
      (begin
        ;; Mark expense as settled
        (map-set expenses expense-id 
          (merge expense {settled: true, settled-at: (some current-block)}))
        
        ;; Update participant payment status
        (map participants (lambda (participant)
          (let ((share-info (unwrap-panic (map-get? participant-shares {expense-id: expense-id, participant: participant}))))
            (if (not (get paid share-info))
              (map-set participant-shares {expense-id: expense-id, participant: participant}
                (merge share-info {paid: true, paid-at: (some current-block)}))
              true
            )
          )
          participant
        ))
        
        ;; Emit settlement event
        (print {event: "expense-settled", expense-id: expense-id, settled-by: tx-sender})
        
        (ok true)
      )
    )
  )
)

;; read only functions
;; Functions for querying expense and balance information

;; Retrieves complete expense information by ID
;; @param expense-id: ID of the expense to retrieve
;; @returns: Expense data tuple or error if not found
(define-read-only (get-expense (expense-id uint))
  (match (map-get? expenses expense-id)
    expense-data (ok expense-data)
    ERR_NOT_FOUND
  )
)

;; Gets all expenses for a specific circle
;; @param circle-id: ID of the target circle
;; @returns: List of expense IDs or error if circle not found
(define-read-only (get-circle-expenses (circle-id uint))
  (ok (default-to (list) (map-get? circle-expenses circle-id)))
)

;; Calculates a member's current balance within a circle
;; @param circle-id: ID of the target circle
;; @param member: Principal to calculate balance for
;; @returns: Net balance (positive = owed money, negative = owes money)
(define-read-only (calculate-member-balance (circle-id uint) (member principal))
  (match (map-get? member-balances {circle-id: circle-id, member: member})
    balance-data (ok (get net-balance balance-data))
    (ok 0) ;; Return 0 if no balance record exists
  )
)

;; Gets the treasury balance for a circle
;; @param circle-id: ID of the target circle
;; @returns: Treasury balance in microSTX
(define-read-only (get-circle-treasury-balance (circle-id uint))
  (match (map-get? circle-treasuries circle-id)
    treasury-data (ok (get balance treasury-data))
    (ok u0) ;; Return 0 if no treasury exists
  )
)

;; Gets participants for a specific expense
;; @param expense-id: ID of the expense
;; @returns: List of participant principals
(define-read-only (get-expense-participants (expense-id uint))
  (match (map-get? expense-participants expense-id)
    participants (ok participants)
    ERR_NOT_FOUND
  )
)

;; private functions
;; Internal helper functions for treasury operations

;; Validates expense parameters
;; @param amount: Expense amount to validate
;; @param description: Description to validate
;; @param participants: Participant list to validate
;; @returns: true if all parameters are valid
(define-private (is-valid-expense (amount uint) (description (string-ascii 100)) (participants (list 20 principal)))
  (and 
    (>= amount MIN_EXPENSE_AMOUNT)
    (<= amount MAX_EXPENSE_AMOUNT)
    (> (len description) u0)
    (<= (len description) MAX_EXPENSE_DESCRIPTION)
    (> (len participants) u0)
    (<= (len participants) MAX_PARTICIPANTS_PER_EXPENSE)
  )
)

;; Updates member balance after expense or payment
;; @param circle-id: Circle ID
;; @param member: Member principal
;; @param amount-change: Change in balance (positive or negative)
;; @returns: Updated balance
(define-private (update-member-balance (circle-id uint) (member principal) (amount-change int))
  (let (
    (current-balance (default-to {amount-owed: u0, amount-paid: u0, net-balance: 0, last-updated: u0} 
                                 (map-get? member-balances {circle-id: circle-id, member: member})))
    (new-net-balance (+ (get net-balance current-balance) amount-change))
  )
    (map-set member-balances {circle-id: circle-id, member: member}
      (merge current-balance {
        net-balance: new-net-balance,
        last-updated: stacks-block-time
      })
    )
    new-net-balance
  )
)

