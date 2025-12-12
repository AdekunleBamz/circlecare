export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-primary-50 to-accent-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold gradient-text mb-8 animate-pulse-gentle">
            CircleCare
          </h1>
          <p className="text-xl text-neutral-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform expense sharing from tracking debts into flowing care within communities
          </p>
          <div className="space-x-4">
            <button className="circlecare-button">
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Floating elements for visual interest */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full opacity-20 animate-flow"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full opacity-20 animate-pulse-gentle"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-accent-400 to-secondary-400 rounded-full opacity-15 animate-flow" style={{animationDelay: '1s'}}></div>
      </div>
    </div>
  )
}