// @flow
import React from "react";
import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Typography
} from "@material-ui/core";
import {activateEmployee, activateEmployeeNew, deactivateEmployee, getEmployees} from "./schedules";

class EmployeeManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            listData: [],
            selectData: "",
            selectList: [],
            submitButtonColor: "primary"
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        getEmployees()
            .then(map => {
                console.log(map);
                this.setState({employees: map});
                this.initLists();
            })
            .catch(console.error);
    }

    initLists() {
        const activeList = [];
        const nonActiveList = [];

        for (let e of this.state.employees) {
            if (e.active) {
                activeList.push(
                    <ListItem key={e.id}>
                        <ListItemText primary={e.name}/>
                        <Button
                            variant="contained"
                            color="secondary"
                            className="removeEmployeeButton"
                            onClick={() => this.sendDeactivateEmployee(e)}
                        >
                            Remove
                        </Button>
                    </ListItem>
                );
            } else {
                nonActiveList.push(
                    <MenuItem value={e.id} key={e.id}>
                        {e.name}
                    </MenuItem>
                );
            }
        }
        console.log("all");
        console.log(this.state.employees);
        console.log("active");
        console.log(activeList);
        console.log("select");
        console.log(nonActiveList);
        console.log("update listdata " + this.state.listData.length);
        this.setState({listData: activeList});
        this.setState({selectList: nonActiveList});
    }

    sendDeactivateEmployee(employee) {
        console.log("Deac " + employee.id);
        console.log(this.state.employees);
        console.log("length" + this.state.employees.length);

        deactivateEmployee(employee).then(() => {
            for (let i = 0; i < this.state.employees.length; i++) {
                console.log("compare");
                //debugger;
                console.log(employee.id + " " + this.state.employees[i].id);
                if (employee.id == this.state.employees[i].id) {
                    this.state.employees[i].active = false;
                    console.log("hit");
                    break;
                }
            }
            console.log(this.state.employees);
            this.initLists();
        })
            .catch(new Error());
    }

    addEmployee(employee) {
        console.log("addemp " + employee);
        this.state.employees.push(employee);
        this.setState({employees: this.state.employees});

        const copy = [...this.state.listData];

        copy.push(
            <ListItem key={employee.id}>
                <ListItemText primary={employee.name}/>
                <Button
                    variant="contained"
                    color="secondary"
                    className="removeEmployeeButton"
                    onClick={() => this.sendDeactivateEmployee(employee)}
                >
                    Remove
                </Button>
            </ListItem>
        );

        const selectCopy = [...this.state.selectList];
        let index = -1;
        for (let i = 0; i < copy.length; i++) {
            if (copy[i].key == employee.id) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            return;
        }
        console.log("index remove select " + index);
        console.log(selectCopy.toString);
        selectCopy.splice(index, 1);
        console.log(selectCopy);
        console.log(selectCopy.length);
        this.setState({listData: copy});
        this.setState({selectList: selectCopy});

    }

    removeEmployee(employee) {
        console.log("addemp " + employee);
        this.state.employees.push(employee);
        this.setState({employees: this.state.employees});

        const copy = [...this.state.listData];
        let index = -1;
        for (let i = 0; i < copy.statatatatatalength; i++) {
            if (copy[i].key == employee.id) {
                index = i;
                break;
            }
        }
        console.log("index " + index);
        if (index == -1) {
            return;
        }
        copy.splice(index, 1);
        const selectCopy = [...this.state.selectList];
        selectCopy.push(<MenuItem value={employee.id} key={employee.id}>
            {employee.name}
        </MenuItem>);
        this.setState({listData: copy});
        this.setState({selectList: selectCopy});
    }

    handleChange = event => {
        this.setState({selectData: event.target.value});
    };

    handleSubmit(event) {
        alert("Your favorite flavor is: " + this.state.value);
        event.preventDefault();
    }

    sendActivateEmployee() {
        if (this.state.selectData == "") {
            this.setState({submitButtonColor: "secondary"});
            return;
        }
        let employeeToActivate = null;
        for (let i = 0; i < this.state.employees.length; i++) {
            if (this.state.employees[i].id == this.state.selectData) {
                employeeToActivate = this.state.employees[i];
                break;
            }
        }
        activateEmployee(employeeToActivate)
            .then(() => {
                this.setState({selectData: ""});
                for (let i = 0; i < this.state.employees.length; i++) {
                    if (employeeToActivate.id == this.state.employees[i].id) {
                        this.state.employees[i].active = true;
                        break;
                    }
                }
                this.initLists();
                //this.addEmployee(employeeToActivate);
            })
            .catch(console.error);
    }

    render() {
        return (
            <Grid container justify="center" alignItems="center" direction="column">
                <Grid item key={0}>
                    <Typography variant="h6">Employees</Typography>
                    <div>
                        <List>{this.state.listData}</List>
                    </div>
                </Grid>
                <Grid item key={1}>
                    <FormControl>
                        <InputLabel htmlFor="name-simple">Employee</InputLabel>
                        <Select
                            value={this.state.selectData}
                            onChange={this.handleChange}
                            style={{width: 200}}
                            inputProps={{
                                name: "name",
                                id: "name-simple"
                            }}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {this.state.selectList}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color={this.state.submitButtonColor}
                        className="addEmployeeButton"
                        style={{marginTop: '16px'}}
                        onClick={() => this.sendActivateEmployee()}
                    >
                        Add Employee
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

export default EmployeeManagement;
