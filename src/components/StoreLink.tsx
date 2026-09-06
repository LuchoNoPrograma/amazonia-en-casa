import { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { sitePath } from '../sitePath';

// Keep real hrefs for crawlers, new tabs and users without JavaScript.
export function StoreLink({href = '/', ...props}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = (href.startsWith('/') && !href.startsWith('//') || href.startsWith('#')) && !/\.[a-z0-9]+(?:[?#]|$)/i.test(href);
  return internal ? <Link to={href} {...props}/> : <a href={sitePath(href)} {...props}/>;
}
