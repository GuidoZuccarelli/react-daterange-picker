import React from 'react';

import PropTypes from 'prop-types';
import createClass from 'create-react-class';
import Immutable from 'immutable';

import BemMixin from '../utils/BemMixin';
import CustomPropTypes from '../utils/CustomPropTypes';
import PureRenderMixin from '../utils/PureRenderMixin';
import lightenDarkenColor from '../utils/lightenDarkenColor';

import CalendarDatePeriod from './CalendarDatePeriod';
import CalendarHighlight from './CalendarHighlight';
import CalendarSelection from './CalendarSelection';


const CalendarDate = createClass({
  mixins: [BemMixin, PureRenderMixin],
  displayName: "CalendarDate",

  propTypes: {
    date: CustomPropTypes.moment,

    firstOfMonth: PropTypes.object.isRequired,

    isSelectedDate: PropTypes.bool,
    isSelectedRangeStart: PropTypes.bool,
    isSelectedRangeEnd: PropTypes.bool,
    isInSelectedRange: PropTypes.bool,

    isHighlightedDate: PropTypes.bool,
    isHighlightedRangeStart: PropTypes.bool,
    isHighlightedRangeEnd: PropTypes.bool,
    isInHighlightedRange: PropTypes.bool,

    highlightedDate: PropTypes.object,
    dateStates: PropTypes.instanceOf(Immutable.List),
    isDisabled: PropTypes.bool,
    isToday: PropTypes.bool,

    dateRangesForDate: PropTypes.func,
    onHighlightDate: PropTypes.func,
    onUnHighlightDate: PropTypes.func,
    onSelectDate: PropTypes.func,
  },

  getInitialState() {
    return {
      mouseDown: false,
    };
  },

  componentWillUnmount() {
    this.isUnmounted = true;
    document.removeEventListener('mouseup', this.mouseUp);
    document.removeEventListener('touchend', this.touchEnd);
  },

  mouseUp() {
    this.props.onSelectDate(this.props.date);

    if (this.isUnmounted) {
      return;
    }

    if (this.state.mouseDown) {
      this.setState({
        mouseDown: false,
      });
    }

    document.removeEventListener('mouseup', this.mouseUp);
  },

  mouseDown() {
    this.setState({
      mouseDown: true,
    });

    document.addEventListener('mouseup', this.mouseUp);
  },

  touchEnd() {
    event.preventDefault();
    this.props.onHighlightDate(this.props.date);
    this.props.onSelectDate(this.props.date);

    if (this.isUnmounted) {
      return;
    }

    if (this.state.mouseDown) {
      this.setState({
        mouseDown: false,
      });
    }
    document.removeEventListener('touchend', this.touchEnd);
  },

  touchStart(event) {
    event.preventDefault();
    this.setState({
      mouseDown: true,
    });
    document.addEventListener('touchend', this.touchEnd);
  },

  mouseEnter() {
    this.props.onHighlightDate(this.props.date);
  },

  mouseLeave() {
    if (this.state.mouseDown) {
      this.props.onSelectDate(this.props.date);

      this.setState({
        mouseDown: false,
      });
    }
    this.props.onUnHighlightDate(this.props.date);
  },

  getBemModifiers() {
    let {date, firstOfMonth, isToday: today} = this.props;

    let otherMonth = false;
    let weekend = false;

    if (date.month() !== firstOfMonth.month()) {
      otherMonth = true;
    }

    if (date.day() === 0 || date.day() === 6) {
      weekend = true;
    }

    return {today, weekend, otherMonth};
  },

  getBemStates() {
    let {
      isSelectedDate,
      isInSelectedRange,
      isInHighlightedRange,
      isHighlightedDate: highlighted,
      isDisabled: disabled,
    } = this.props;

    let selected = isSelectedDate || isInSelectedRange || isInHighlightedRange;

    return {disabled, highlighted, selected};
  },

  render() {
    let {
      date,
      dateRangesForDate,
      isSelectedDate,
      isSelectedRangeStart,
      isSelectedRangeEnd,
      isInSelectedRange,
      isHighlightedDate,
      isHighlightedRangeStart,
      isHighlightedRangeEnd,
      isInHighlightedRange,
    } = this.props;

    let bemModifiers = this.getBemModifiers();
    let bemStates = this.getBemStates();
    let pending = isInHighlightedRange;

    let stateClass;
    let amClass;
    let pmClass;
    let states = dateRangesForDate(date);

    let numStates = states.count();

    let highlightModifier;
    let selectionModifier;

    if (isSelectedDate || (isSelectedRangeStart && isSelectedRangeEnd)
        || (isHighlightedRangeStart && isHighlightedRangeEnd)) {
      selectionModifier = 'single';
    } else if (isSelectedRangeStart || isHighlightedRangeStart) {
      selectionModifier = 'start';
    } else if (isSelectedRangeEnd || isHighlightedRangeEnd) {
      selectionModifier = 'end';
    } else if (isInSelectedRange || isInHighlightedRange) {
      selectionModifier = 'segment';
    }

    if (isHighlightedDate) {
      highlightModifier = 'single';
    }

    if (numStates === 1) {
      // If there's only one state, it means we're not at a boundary
      stateClass = states.getIn([0, 'state']);
    } else {
      amClass = 'am_' + states.getIn([0, 'state']);
      pmClass = 'pm_' + states.getIn([1, 'state']);
    }

    return (
      <td className={this.cx({element: 'Date', modifiers: bemModifiers, states: bemStates})}
        onTouchStart={this.touchStart}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        onMouseDown={this.mouseDown}>
        {numStates > 1 &&
          <div className={this.cx({element: "HalfDateStates"})}>
            <div className={amClass} />
            <div className={pmClass} />
          </div>}
        {numStates === 1 &&
          <div className={stateClass} />}
        {selectionModifier ? <CalendarSelection modifier={selectionModifier} pending={pending} /> : null}
        {highlightModifier ? <CalendarHighlight modifier={highlightModifier} /> : null}
        <span className={this.cx({element: "DateLabel"})}>{date.format('D')}</span>
      </td>
    );
  },
});

export default CalendarDate;
