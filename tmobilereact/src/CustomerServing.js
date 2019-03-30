import React from "react";
import {activateEmployee, deactivateEmployee, dequeueTask, getEmployees} from "./schedules";
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
    chipContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
    buttonRow: {

    },
    noLabel: {
        marginTop: theme.spacing.unit * 3,
    },
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

    render() {
        const { classes, currentTask } = this.props;
        console.log(this.props.employeeSchedule);

        const constraintChips = Object.entries(currentTask.constraints).map(([key, value]) => `${key}:${value}`);

        return (<div>
            <Typography>{currentTask.title}</Typography>
            <Typography>{currentTask.phone}</Typography>
            <div className={classes.chipContainer}>
                {constraintChips.map(text => (<Chip label={text} className={classes.chip} />))}
            </div>
            <div className={classes.buttonRow}>
                <Button>End Interaction</Button>
                <Button>End Interaction &amp; Go to next customer</Button>
            </div>
        </div>);
    }
}


CustomerServing.propTypes = {
    classes: PropTypes.object.isRequired,
    onTaskChange: PropTypes.func.isRequired,
    currentTask: PropTypes.object.isRequired,
    employee: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomerServing);
