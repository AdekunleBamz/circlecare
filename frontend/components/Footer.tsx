import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">CircleCare</h3>
            <p className="text-sm">Care-centered expense sharing on Stacks</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:text-gray-300">About</a>
            <a href="#" className="text-sm hover:text-gray-300">Docs</a>
            <a href="#" className="text-sm hover:text-gray-300">GitHub</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; 2024 CircleCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
