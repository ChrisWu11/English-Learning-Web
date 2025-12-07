import '../styles/Layout.scss';

const Layout = ({ sidebar, main }) => {
  return (
    <div className="app-container">
      {sidebar}
      {main}
    </div>
  );
};

export default Layout;