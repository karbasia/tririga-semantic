import PropTypes from 'prop-types';

export default function Progress({ text, percentage }) {

  Progress.propTypes = {
    text: PropTypes.string,
    percentage: PropTypes.number
  }

  percentage = percentage ?? 0;
  return (
    <div className="progress-container">
      <div className='progress-bar' style={{ 'width': `${percentage}%` }}>
        {text} ({`${percentage.toFixed(2)}%`})
      </div>
    </div>
  );
}