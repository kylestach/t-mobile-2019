// @flow
import React from "react";
import {activateEmployee, completeTask, deactivateEmployee, dequeueTask, getEmployees} from "./schedules";
import {Button, Typography, withStyles} from "@material-ui/core";
import PropTypes from "prop-types";
import Chip from "@material-ui/core/Chip";

// const employeeId = 5;


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}


const styles = theme => ({
    root: {
        padding: '16px',
        textAlign: 'center',
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
    chipContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
    buttonRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    noLabel: {
        marginTop: theme.spacing.unit * 3,
    },
    spacer: {
        flexGrow: 1,
    }
});


class CustomerServing extends React.Component {
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

    phoneFormatted(rawPhone) {
        const phone = rawPhone
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replace(' ', '');

        return '(' + phone.substring(0, 3) + ')-'  + phone.substring(3, 6) + ' ' + phone.substring(6);
    }

    onEndInteraction = () => {
        completeTask(this.props.employee.id).then(() => {
            this.props.onTaskChange(null);
        }).catch(console.error);
    };

    onEndAndNextCustomer = () => {
        completeTask(this.props.employee.id).then(() => {
            dequeueTask(this.props.employee.id).then(task => {
                this.props.onTaskChange(task);
            }).catch(console.error);
        }).catch(console.error);
    };

    get canDequeueCustomer() {
        return this.props.employeeSchedule.length && (this.props.employeeSchedule[0].onlineTime === null || this.props.employeeSchedule[0] < new Date());
    }

    render() {
        const { classes, currentTask } = this.props;
        console.log(this.props.employeeSchedule);

        const constraintChips = Object.entries(currentTask.constraints).map(([key, value]) => `${key}:${value}`);

        return (<div className={classes.root}>
            <Typography variant='display2'>{currentTask.title}</Typography>
            <Typography variant='display1'>{this.phoneFormatted(currentTask.phone)}</Typography>
            <div className={classes.chipContainer}>
                {constraintChips.map(text => (<Chip key={text} label={text} className={classes.chip} />))}
            </div>
            <div>

            </div>
            <div className={classes.buttonRow}>
                <div className={classes.spacer}/>
                <Button variant="contained" color="primary" onClick={this.onEndInteraction}>End Interaction</Button>
                <div className={classes.spacer}/>
                {this.canDequeueCustomer ? (
                    <React.Fragment>
                        <Button variant="contained" color="primary" onClick={this.onEndAndNextCustomer}>End &amp; Next customer</Button>
                        <div className={classes.spacer}/>
                    </React.Fragment>
                ) : null}
            </div>
        </div>);
    }
}


CustomerServing.propTypes = {
    classes: PropTypes.object.isRequired,
    onTaskChange: PropTypes.func.isRequired,
    currentTask: PropTypes.object.isRequired,
    employeeSchedule: PropTypes.array.isRequired,
    employee: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomerServing);
