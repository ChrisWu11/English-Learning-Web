/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState
} from 'react';

const RouterContext = createContext({
  pathname: '/',
  fullPath: '/',
  basename: '',
  navigate: () => {}
});

const normalizeBase = (base = '/') => {
  if (!base) return '/';
  const ensured = base.startsWith('/') ? base : `/${base}`;
  if (ensured === '/') return '/';
  return ensured.replace(/\/$/, '');
};

const ensureLeadingSlash = (path = '/') => (path.startsWith('/') ? path : `/${path}`);

const trimBasename = (pathname, basename) => {
  if (!basename || basename === '/') return pathname || '/';
  if (pathname.startsWith(basename)) {
    const trimmed = pathname.slice(basename.length) || '/';
    return ensureLeadingSlash(trimmed);
  }
  return pathname || '/';
};

const buildHref = (basename, to) => {
  const normalizedBase = basename ? normalizeBase(basename) : '';
  const normalizedTo = ensureLeadingSlash(to || '/');
  const combined = `${normalizedBase}${normalizedTo}`.replace(/\/+/g, '/');
  return combined.startsWith('/') ? combined : `/${combined}`;
};

const matchPath = (path, pathname) => {
  if (path === '*') return true;
  const target = ensureLeadingSlash(path);
  const current = ensureLeadingSlash(pathname);
  return current === target || current.startsWith(`${target}/`);
};

export function BrowserRouter({ basename = '/', children }) {
  const normalizedBase = normalizeBase(basename);
  const [location, setLocation] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePop = () => setLocation(window.location.pathname || '/');
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const target = buildHref(normalizedBase === '/' ? '' : normalizedBase, to || '/');
    if (replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    setLocation(window.location.pathname || '/');
  }, [normalizedBase]);

  const value = useMemo(() => ({
    pathname: trimBasename(location, normalizedBase),
    fullPath: location || '/',
    basename: normalizedBase === '/' ? '' : normalizedBase,
    navigate
  }), [location, navigate, normalizedBase]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
  let match = null;
  Children.forEach(children, (child) => {
    if (match || !child) return;
    const path = child.props?.path ?? '*';
    if (matchPath(path, pathname)) {
      match = child;
    }
  });
  return match ? cloneElement(match) : null;
}

export function Route({ element }) {
  return element || null;
}

export function Navigate({ to, replace = false }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
}

export const Link = forwardRef(({ to, replace = false, onClick, ...rest }, ref) => {
  const { basename } = useContext(RouterContext);
  const navigate = useNavigate();
  const href = buildHref(basename, to);

  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to, { replace });
  };

  return <a {...rest} ref={ref} href={href} onClick={handleClick} />;
});

export const useNavigate = () => useContext(RouterContext).navigate;

export const useLocation = () => {
  const { pathname, fullPath } = useContext(RouterContext);
  return { pathname, fullPath };
};
