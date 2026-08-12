import { Link } from 'react-router-dom';

export default function AddContactCard({ group }) {
  return (
    <Link className="card card--add" to={`/add-contact?group=${group}`} aria-label="Add contact 添加联系人">
      <span className="crop" style={{ '--w': '87px', '--h': '87px' }}>
        <img
          src="/assets/add-icon.png"
          alt=""
          style={{ '--iw': '408.19px', '--ih': '283.65px', '--ix': '-163.27px', '--iy': '-29.92px' }}
        />
      </span>
      <p className="card__name">
        <span className="t-en">Add</span>
        <span className="t-cn">添加</span>
      </p>
    </Link>
  );
}
