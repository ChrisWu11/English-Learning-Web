import '../styles/Layout.scss';

const NavSidebar = ({ articles, activeId, onSelect, collapsed }) => {
  return (
    <div className={`sidebar-nav ${collapsed ? 'collapsed' : ''}`}>
      <h2>🇬🇧 English Study</h2>
      <nav>
        {articles.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.title}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default NavSidebar;