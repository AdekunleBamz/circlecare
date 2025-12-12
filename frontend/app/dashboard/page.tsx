export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Your Circles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="circlecare-card p-6">
          <h3 className="text-lg font-semibold mb-2 text-neutral-800">Family Expenses</h3>
          <p className="text-neutral-600 mb-4">3 members • $245.50 total</p>
          <button className="circlecare-button w-full">View Circle</button>
        </div>
        
        <div className="circlecare-card p-6">
          <h3 className="text-lg font-semibold mb-2 text-neutral-800">Roommate Bills</h3>
          <p className="text-neutral-600 mb-4">4 members • $892.30 total</p>
          <button className="circlecare-button w-full">View Circle</button>
        </div>
        
        <div className="border-2 border-dashed border-primary-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-primary-400 transition-colors">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-neutral-800">Create New Circle</h3>
          <p className="text-neutral-600 mb-4">Start sharing expenses with your community</p>
          <button className="circlecare-button-secondary">Get Started</button>
        </div>
      </div>
    </div>
  )
}