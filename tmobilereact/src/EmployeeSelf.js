import React from "react";
import {
  activateEmployee,
  deactivateEmployee,
  getEmployees
} from "./schedules";
import { Button, Typography, withStyles, Grid } from "@material-ui/core";
import PropTypes from "prop-types";

// const employeeId = 5;

function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}

const styles = theme => ({
  root: {
    position: "relative",
    height: "100%"
  },
  navigator: {
    position: "fixed",
    width: "100%",
    bottom: "0"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300
  },
  wideFormControl: {
    margin: theme.spacing.unit,
    minWidth: 300,
    maxWidth: 600
  },
  button: {
    margin: theme.spacing.unit
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  noLabel: {
    marginTop: theme.spacing.unit * 3
  }
});

class EmployeeSelf extends React.Component {
  state = {
    employee: null
  };

  constructor() {
    super();

    getEmployees().then(employees => {
      this.setState({ employee: employees[0] || null });
    });
  }

  get isActive() {
    return this.state.employee && this.state.employee.active;
  }

  get currentName() {
    return this.state.employee
      ? this.state.employee.name
      : "Failed to load user";
  }

  get currentStatus() {
    return this.isActive ? "Active" : "Inactive";
  }

  onToggleActive = () => {
    console.log("hgds");

    if (this.isActive) {
      deactivateEmployee(this.state.employee)
        .then(() => {
          const nUser = clone(this.state.employee);
          nUser.active = false;
          this.setState({ employee: nUser });
        })
        .catch(console.error);
    } else {
      activateEmployee(this.state.employee)
        .then(() => {
          const nUser = clone(this.state.employee);
          nUser.active = true;
          this.setState({ employee: nUser });
        })
        .catch(console.error);
    }
  };

  onLoadNextCustomer = () => {
    console.log("load");
  };

  render() {
    return this.state.employee ? (
      <div>
        <Grid container direction="column" justify="center" alignItems="center" alignContent="center">
          <Typography variant="h1">{this.currentName}</Typography>
          <Typography variant="h4">Status: {this.currentStatus}</Typography>
          <Button
            variant="contained"
            color={this.isActive ? "secondary" : "primary"}
            onClick={this.onToggleActive}
            size="large"
          >
            Set {this.isActive ? "Inactive" : "Active"}
          </Button>
        </Grid>
      </div>
    ) : (
      <Typography>Loading employee</Typography>
    );
  }
}

EmployeeSelf.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EmployeeSelf);
