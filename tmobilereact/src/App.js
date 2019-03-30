// @flow
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {withStyles} from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import {Grid} from "@material-ui/core";
import InputMask from "react-input-mask";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import RestoreIcon from '@material-ui/icons/Restore';
import CurrentSchedule from "./CurrentSchedule";
import {getEmployees, getSchedule} from "./schedules";
import AddToQueue from "./AddToQueue";
import EmployeeSelf from "./EmployeeSelf";
import CustomerIdle from "./CustomerIdle";
import CustomerServing from "./CustomerServing";
import EmployeeManagement from "./EmployeeManagement";

const styles = theme => ({
    container: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    dense: {
        marginTop: 16
    },
    menu: {
        width: 200
    }
});

const currencies = [
    {
        value: "USD",
        label: "$"
    },
    {
        value: "EUR",
        label: "€"
    },
    {
        value: "BTC",
        label: "฿"
    },
    {
        value: "JPY",
        label: "¥"
    }
];

const topics = [
    {
        name: "USD",
        label: "$"
    },
    {
        name: "EUR",
        label: "€"
    },
    {
        name: "BTC",
        label: "฿"
    },
    {
        name: "JPY",
        label: "¥"
    }
];

class OutlinedTextFields extends React.Component {
    state = {
        name: "",
        phoneNumber: "",
        email: "",
        multiline: "Controlled",
        topics: [],
        currency: "EUR"
    };

    handleChange = name => event => {
        this.setState({
            [name]: event.target.value
        });
    };

    getStyles(name, that) {
        return {
            fontWeight:
                currencies.indexOf(name) === -1
                    ? that.props.theme.typography.fontWeightRegular
                    : that.props.theme.typography.fontWeightMedium,
        };
    }

    render() {
        const {classes} = this.props;

        return (
            <form className={classes.container} noValidate autoComplete="off">
                <Grid container className="GridName" justify="center" spacing={20}>
                    <Grid key={0} item>
                        <TextField
                            id="outlined-name"
                            label="Name"
                            className={classes.textField}
                            value={this.state.name}
                            onChange={this.handleChange("name")}
                            margin="normal"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Grid container className="GridPhone" justify="center" spacing={20}>
                    <Grid key={0} item>
                        <InputMask mask="(1)999 999 9999" maskChar=" " value={this.state.phoneNumber}
                                   onChange={this.handleChange("phoneNumber")}>
                            {() => <TextField
                                id="outlined-phone"
                                label="Phone Number"
                                className={classes.textField}

                                margin="normal"
                                variant="outlined"
                            />}
                        </InputMask>

                    </Grid>
                </Grid>
                <Grid container className="GridEmail" justify="center" spacing={20}>
                    <Grid key={0} item>
                        <TextField
                            id="outlined-email"
                            label="Email"
                            className={classes.textField}
                            value={this.state.email}
                            onChange={this.handleChange("email")}
                            margin="normal"
                            variant="outlined"
                        />

                    </Grid>
                </Grid>

                <Grid container className="GridTopic" justify="center" spacing={20}>
                    <Grid key={0} item>
                        <MultipleSelect/>
                    </Grid>
                </Grid>
                <TextField
                    id="outlined-select-currency"
                    select
                    label="Select"
                    className={classes.textField}
                    value={this.state.currency}
                    onChange={this.handleChange("currency")}
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    helperText="Please select your currency"
                    margin="normal"
                    variant="outlined"
                >
                    {currencies.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    error
                    id="outlined-error"
                    label="Error"
                    defaultValue="Hello World"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    disabled
                    id="outlined-disabled"
                    label="Disabled"
                    defaultValue="Hello World"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-email-input"
                    label="Email"
                    className={classes.textField}
                    type="email"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-password-input"
                    label="Password"
                    className={classes.textField}
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-read-only-input"
                    label="Read Only"
                    defaultValue="Hello World"
                    className={classes.textField}
                    margin="normal"
                    InputProps={{
                        readOnly: true
                    }}
                    variant="outlined"
                />

                <TextField
                    id="outlined-dense"
                    label="Dense"
                    className={classNames(classes.textField, classes.dense)}
                    margin="dense"
                    variant="outlined"
                />

                <TextField
                    id="outlined-multiline-flexible"
                    label="Multiline"
                    multiline
                    rowsMax="4"
                    value={this.state.multiline}
                    onChange={this.handleChange("multiline")}
                    className={classes.textField}
                    margin="normal"
                    helperText="hello"
                    variant="outlined"
                />

                <TextField
                    id="outlined-multiline-static"
                    label="Multiline"
                    multiline
                    rows="4"
                    defaultValue="Default Value"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-helperText"
                    label="Helper text"
                    defaultValue="Default Value"
                    className={classes.textField}
                    helperText="Some important text"
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-with-placeholder"
                    label="With placeholder"
                    placeholder="Placeholder"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-textarea"
                    label="Multiline Placeholder"
                    placeholder="Placeholder"
                    multiline
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-number"
                    label="Number"
                    value={this.state.age}
                    onChange={this.handleChange("age")}
                    type="number"
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true
                    }}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-search"
                    label="Search field"
                    type="search"
                    className={classes.textField}
                    margin="normal"
                    variant="outlined"
                />

                <TextField
                    id="outlined-select-currency"
                    select
                    label="Select"
                    className={classes.textField}
                    value={this.state.currency}
                    onChange={this.handleChange("currency")}
                    SelectProps={{
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    helperText="Please select your currency"
                    margin="normal"
                    variant="outlined"
                >
                    {currencies.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    id="outlined-select-currency-native"
                    select
                    label="Native select"
                    className={classes.textField}
                    value={this.state.currency}
                    onChange={this.handleChange("currency")}
                    SelectProps={{
                        native: true,
                        MenuProps: {
                            className: classes.menu
                        }
                    }}
                    helperText="Please select your currency"
                    margin="normal"
                    variant="outlined"
                >
                    {currencies.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </TextField>
                <TextField
                    id="outlined-full-width"
                    label="Label"
                    style={{margin: 8}}
                    placeholder="Placeholder"
                    helperText="Full width!"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true
                    }}
                />

                <TextField
                    id="outlined-bare"
                    className={classes.textField}
                    defaultValue="Bare"
                    margin="normal"
                    variant="outlined"
                />
            </form>
        );
    }
}

function getStyles(name, that) {
    return {
        fontWeight:
            that.state.name.indexOf(name) === -1
                ? "fontWeightRegular"
                : "fontWeightMedium"
    };
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

class MultipleSelect extends React.Component {
    state = {
        name: [],
    };
    styles = theme => ({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
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
    handleChange = event => {
        this.setState({name: event.target.value});
    };

    handleChangeMultiple = event => {
        const {options} = event.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i += 1) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        this.setState({
            name: value,
        });
    };

    render() {
        const {classes} = this.props;

        return (
            <div>
                <FormControl>
                    <InputLabel htmlFor="select-multiple">Topics</InputLabel>
                    <Select
                        multiple
                        value={this.state.name}
                        onChange={this.handleChange}
                        input={<Input id="select-multiple"/>}
                        MenuProps={MenuProps}
                    >
                        {topics.map(topic => (
                            <MenuItem key={topic.name} value={topic.name} style={getStyles(topic, this)}>
                                {topic.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </div>
        );
    }
}

OutlinedTextFields.propTypes = {
    classes: PropTypes.object.isRequired
};

const appStyles = theme => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    navigator: {},
    container: {
        flexGrow: 1,
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

const events = [
    {
        id: 0,
        title: 'Board meeting',
        start: new Date(2019, 2, 30, 9, 0, 0),
        end: new Date(2019, 2, 30, 13, 0, 0),
        resourceId: 1,
    },
    {
        id: 2,
        title: 'Team lead meeting',
        start: new Date(2019, 2, 30, 8, 30, 0),
        end: new Date(2019, 2, 30, 12, 30, 0),
        resourceId: 3,
    },
    {
        id: 4,
        title: 'Team lead meeting',
        start: new Date(2019, 2, 30, 12, 30, 0),
        end: new Date(2019, 2, 30, 13, 30, 0),
        resourceId: 3,
    },
    {
        id: 11,
        title: 'Birthday Party',
        start: new Date(2019, 2, 30, 7, 0, 0),
        end: new Date(2019, 2, 30, 10, 30, 0),
        resourceId: 4,
    },
];

const employees = [
    {userId: 1, displayName: 'Board room'},
    {userId: 2, displayName: 'Training room'},
    {userId: 3, displayName: 'Meeting room 1'},
    {userId: 4, displayName: 'Meeting room 2'},
];

const tabs = [
    {name: 'Add Queue', icon: () => (<RestoreIcon/>), content: () => (<AddToQueue/>)},
    {name: 'Employees', icon: () => (<RestoreIcon/>), content: () => (<EmployeeManagement/>)},
    {
        name: 'Current Schedule',
        icon: () => (<RestoreIcon/>),
        content: () => (<CurrentSchedule events={events} employees={employees}/>)
    },
    {
        name: 'Customer', icon: () => (<RestoreIcon/>), content: (comp) => {

            if (comp.state.activeTask === null) {
                return <CustomerIdle
                    onTaskChange={comp.handleTaskChange}
                    employeeSchedule={comp.activeEmployeeSchedule}
                    employee={comp.activeEmployee}/>;
            } else {
                return <CustomerServing
                    onTaskChange={comp.handleTaskChange}
                    currentTask={comp.state.activeTask}
                    employeeSchedule={comp.activeEmployeeSchedule}
                    employee={comp.activeEmployee}/>;
            }
        }
    },
    {name: 'Me', icon: () => (<RestoreIcon/>), content: () => (<EmployeeSelf/>)},
];

class App extends React.Component {
    state = {
        tabIndex: 0,
        name: [],
        schedule: {},
        employees: [],
        activeEmployeeId: "2",
        activeTask: null,
    };

    constructor() {
        super();

        setInterval(() => {

            getEmployees().then(employees => {
                let task = null;

                for (let employee of employees) {
                    if (employee.id === this.state.activeEmployeeId) {
                        task = employee.currentTask;
                        break;
                    }
                }

                this.setState({employees, activeTask: task});
            });

            getSchedule().then(schedule => {
                this.setState({schedule});
            });

        }, 2000)

    }

    get activeEmployee() {
        if (this.state.activeEmployeeId === null) {
            return null;
        }

        for (let e of this.state.employees) {
            if (e.id === this.state.activeEmployeeId) {
                return e;
            }
        }

        return null;
    }

    get activeEmployeeSchedule() {
        const events = this.state.schedule.events;
        if (!events) {
            return [];
        }

        return events.filter(e => e.employeeId === this.state.activeEmployeeId);
    }

    handleTabChange = (event, value) => {
        this.setState({tabIndex: value});
    };

    handleTaskChange = (newTask) => {
        this.setState({activeTask: newTask});
    };

    render() {
        const {classes} = this.props;
        const {tabIndex} = this.state;

        console.log(this.state);

        return (
            <div className={classes.root}>
                <div className={classes.container}>
                    {tabIndex < tabs.length ? tabs[tabIndex].content(this) : null}
                </div>
                <BottomNavigation
                    value={tabIndex}
                    onChange={this.handleTabChange}
                    showLabels
                    className={classes.navigator}
                    style={{height: '70px'}}>
                    {tabs.map((item, i) => (<BottomNavigationAction key={i} label={item.name} icon={item.icon()}/>))}
                </BottomNavigation>
            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(appStyles)(App);
