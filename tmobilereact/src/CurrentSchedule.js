import RestoreIcon from "./App";
import {Typography, withStyles} from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";
import BigCalendar from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {getSchedule} from "./schedules";

const styles = theme => ({
    root: {
        position: 'relative',
        height: '100%',
    },
    navigator: {
        position: 'fixed',
        width: '100%',
        bottom: '0',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
        maxWidth: 300,
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
    noLabel: {
        marginTop: theme.spacing.unit * 3,
    },
});

const localizer = BigCalendar.momentLocalizer(moment);

class CurrentSchedule extends React.Component {
    state = {
        tabIndex: 0,
        employees: [],
        events: [],
    };

    // handleTabChange = (event, value) => {
    //     this.setState({tabIndex: value});
    // };
    constructor() {
        super();

        getSchedule().then(data => {
            console.log(data);
            this.setState({employees: data.employees, events: data.events});
        }).catch(console.error);

    }


    render() {
        const {classes} = this.props;
        const {events, employees} = this.state;

        let start, end;
        if (events.length === 0) {
            start = new Date();
            start.setHours(9, 0, 0, 0);
            end = new Date();
            end.setHours(17, 0, 0, 0);
        } else {
            start = events[0].start;
            end = events[0].end;

            for (let event of events) {
                if (event.start < start) {
                    start = event.start;
                }

                if (event.end > end) {
                    end = event.end;
                }
            }

            start = new Date((+start) - 5 * 60 * 1000);
            end = new Date((+end) + 5 * 60 * 1000);
        }

        return (
            <div className={classes.root}>
                <BigCalendar
                    events={events}
                    localizer={localizer}
                    defaultView={BigCalendar.Views.DAY}
                    views={['day']}
                    min={start}
                    max={end}
                    step={60}
                    defaultDate={new Date()}
                    resources={employees}
                    resourceIdAccessor="id"
                    resourceTitleAccessor="displayName"
                />
            </div>
        );
    }
}

CurrentSchedule.propTypes = {
    classes: PropTypes.object.isRequired,
    events: PropTypes.array.isRequired,
    employees: PropTypes.array.isRequired,
};

export default withStyles(styles)(CurrentSchedule);
