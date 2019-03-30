import React from "react";
import {activateEmployee, deactivateEmployee, dequeueTask, getEmployees} from "./schedules";
import {Button, Typography, withStyles} from "@material-ui/core";
import PropTypes from "prop-types";

// const employeeId = 5;


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}


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
    wideFormControl: {
        margin: theme.spacing.unit,
        minWidth: 300,
        maxWidth: 600,
    },
    button: {
        margin: theme.spacing.unit,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
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


class CustomerIdle extends React.Component {
    state = {
        employee: null,

    };

    constructor() {
        super();

    }

    onLoadNextCustomer = () => {
        console.log('load');

        dequeueTask(this.props.employee.id).then(task => {
            this.props.onTaskChange(task);
        }).catch(console.error);

    };

    get queueStatusMessage() {
        if (this.canDequeueCustomer) {
            return "You've got a queued customer."
        }

        if (this.isWaitingForNextTask) {
            return "You've got a queued customer but they haven't checked in yet. If they don't show up within a few minutes, you may be assigned to a new customer.";
        }


        return "You don't have any queued customers right now."
    }

    get isWaitingForNextTask() {
        return this.props.employeeSchedule.length && this.props.employeeSchedule[0].onlineTime !== null && this.props.employeeSchedule[0] > new Date();
    }

    get canDequeueCustomer() {
        return this.props.employeeSchedule.length && (this.props.employeeSchedule[0].onlineTime === null || this.props.employeeSchedule[0] < new Date());
    }

    render() {
        console.log(this.props.employeeSchedule);

        if (!this.props.employeeSchedule) {
            return <Typography>Loading...</Typography>;
        }

        return (<div>
            <Typography>{this.queueStatusMessage}</Typography>
            <Button variant="contained" color="primary" onClick={this.onLoadNextCustomer} disabled={!this.canDequeueCustomer}>Next Customer</Button>
        </div>);
    }
}


CustomerIdle.propTypes = {
    classes: PropTypes.object.isRequired,
    onTaskChange: PropTypes.func.isRequired,
    employeeSchedule: PropTypes.array.isRequired,
    employee: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomerIdle);
