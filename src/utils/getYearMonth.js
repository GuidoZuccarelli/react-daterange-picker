import moment from '../moment-range';
import isMomentRange from './isMomentRange';

export function getYearMonth(date) {
  if (!moment.isMoment(date)) {
    return undefined;
  }

  return { year: date.year(), month: date.month() };
}

export const getYearMonthProps = function (props) {
  const { value, initialYear, initialMonth } = props;
  if (!(moment.isMoment(value) || isMomentRange(value))) {
    return { year: initialYear, month: initialMonth };
  }

  if (!isMomentRange(value)) {
    return getYearMonth(value);
  }

  return getYearMonth(moment(value.start).subtract(1, 'M'));
};

export const getOptionalYearProps = function (props) {
  const { preventMoveOnCompleteRange, initialYear, initialMonth } = props;
  return preventMoveOnCompleteRange ? { year: initialYear, month: initialMonth } : getYearMonthProps(props);
};
