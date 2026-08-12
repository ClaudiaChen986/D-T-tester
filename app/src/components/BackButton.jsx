import { Link } from 'react-router-dom';

/**
 * The circular "返回 return" back button + its rotated wordmark, identical
 * across every page except the home screen (which uses the medallion logo
 * instead). `.crop` — also on this element for its sprite-crop sizing — sets
 * pointer-events: none; `.return` (in styles.css) turns that back on for
 * this one interactive crop. See README for how that bug slipped through
 * the static prototype.
 */
export default function BackButton({ to, label = 'Back 返回' }) {
  return (
    <>
      <Link
        className="crop return"
        to={to}
        style={{ '--x': '9px', '--y': '16px', '--w': '93px', '--h': '93px' }}
        aria-label={label}
      >
        <img
          src="/assets/return-button.png"
          alt=""
          style={{ '--iw': '414.68px', '--ih': '288.1px', '--ix': '-147.91px', '--iy': '-160.29px' }}
        />
      </Link>

      <div className="wordmark wordmark--return" aria-hidden="true">
        <span style={{ '--x': '6.56px', '--y': '90.41px', '--w': '23.743px', '--h': '22.607px' }}>
          <i style={{ '--r': '52.91deg' }}>返</i>
        </span>
        <span style={{ '--x': '21.43px', '--y': '99.65px', '--w': '22.019px', '--h': '23.744px' }}>
          <i style={{ '--r': '32.94deg' }}>回</i>
        </span>
        <span style={{ '--x': '45.26px', '--y': '105.56px', '--w': '9.41px', '--h': '20.213px' }}>
          <i style={{ '--r': '7.86deg' }}>r</i>
        </span>
        <span style={{ '--x': '54.2px', '--y': '105.73px', '--w': '8.248px', '--h': '19.645px' }}>
          <i style={{ '--r': '-1.37deg' }}>e</i>
        </span>
        <span style={{ '--x': '61.59px', '--y': '103.79px', '--w': '9.849px', '--h': '20.261px' }}>
          <i style={{ '--r': '-12.29deg' }}>t</i>
        </span>
        <span style={{ '--x': '66.4px', '--y': '100.39px', '--w': '15.703px', '--h': '21.602px' }}>
          <i style={{ '--r': '-19.62deg' }}>u</i>
        </span>
        <span style={{ '--x': '74.37px', '--y': '96.07px', '--w': '16.24px', '--h': '20.063px' }}>
          <i style={{ '--r': '-32.66deg' }}>r</i>
        </span>
        <span style={{ '--x': '79.37px', '--y': '89.44px', '--w': '20.241px', '--h': '20.988px' }}>
          <i style={{ '--r': '-41.89deg' }}>n</i>
        </span>
      </div>
    </>
  );
}
