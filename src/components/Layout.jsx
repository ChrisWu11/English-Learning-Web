import '../styles/Layout.scss';

const Layout = ({ sidebar, main, isBackdropVisible, onCloseAll }) => {
  return (
    <div className="app-container">
      {/* 统一遮罩层：点击关闭所有抽屉 */}
      <div 
        className={`sidebar-backdrop ${isBackdropVisible ? 'visible' : ''}`} 
        onClick={onCloseAll}
      ></div>

      {sidebar}
      {main}
    </div>
  );
};

export default Layout;