import { NavLink } from 'react-router-dom';

export default function Footer() {
  const links = {
    Product: [
      { name: 'Marketplace', path: '/marketplace' },
      { name: 'Learn', path: '/learn' },
      { name: 'Community', path: '/community' },
      { name: 'Pricing', path: '/pricing' },
    ],
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Blog', path: '/blog' },
    ],
    Legal: [
      { name: 'Privacy', path: '/privacy' },
      { name: 'Terms', path: '/terms' },
    ],
    Connect: [
      { name: 'Discord', path: 'https://discord.gg/n8ngalaxy', external: true },
      { name: 'Twitter/X', path: 'https://twitter.com/n8ngalaxy', external: true },
      { name: 'YouTube', path: 'https://youtube.com/@n8ngalaxy', external: true },
    ],
  };

  return (
    <footer className="bg-[#0a0a0f] border-t border-white/10 pt-16 pb-8 px-6 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between w-full">
        <div className="mb-12 md:mb-0 max-w-sm">
          <NavLink to="/" className="flex items-center mb-6">
            <span className="font-sans font-bold text-white text-2xl">n8n</span>
            <span className="font-display font-extrabold text-[#7c3aed] text-2xl ml-0.5">Galaxy</span>
          </NavLink>
          <p className="font-sans text-gray-400 mb-6 max-w-[250px]">
            The premium n8n workflow marketplace for automation engineers.
          </p>
        </div>
        <div className="flex-1 max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-sm">{category}</h3>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.name}>
                    {'external' in item && item.external ? (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <NavLink
                        to={item.path}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
        <p className="text-gray-500 text-sm">
          &copy; 2026 n8nGalaxy. Built by Anasan Rai.
        </p>
      </div>
    </footer>
  );
}
