/*
<FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-simple">Age</InputLabel>
        <Select
          value={state.age}
          onChange={handleChange}
          inputProps={{
            name: 'age',
            id: 'age-simple',
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
 */

import PropTypes from "prop-types";
import { Typography, withStyles } from "@material-ui/core";
import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import MaskedInput from "react-text-mask";
import Input from "@material-ui/core/Input";
import { getAppointment, getEmployees } from "./schedules";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";

function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      guide={false}
      mask={[
        "(",
        /[1-9]/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/
      ]}
      placeholderChar={"\u2000"}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired
};

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

const appointments = [
  {
    id: 0,
    firstName: "Clark",
    lastName: "Marks",
    phone: "(610) 867-5309",
    time: new Date()
  },
  {
    id: 1,
    firstName: "Eric",
    lastName: "Wunsch",
    phone: "(404) 867-5309",
    time: new Date()
  },
  {
    id: 2,
    firstName: "Yessenia",
    lastName: "Bartoletti",
    phone: "(267) 867-5309",
    time: new Date()
  }
];

class AddToQueue extends React.Component {
  state = {
    selectedAppointmentId: "", // id in appointments[], not id of object
    firstName: "",
    lastName: "",
    phone: "",
    employees: [],
    appointments: [],
    selectedEmployeeId: "",
      language: 'english',
    isRecording: true,
    recognition: window.SpeechRecognition,
    finalTranscript: "",
    task_name: "",
    isChrome: false
  };

  constructor() {
    super();

    getEmployees()
      .then(employees => {
        this.setState({ employees });
      })
      .catch(console.error);

    getAppointment()
      .then(appointments => {
        this.setState({ appointments });
      })
      .catch(console.error);
    //this.state.isChrome = !!window.chrome && !!window.chrome.webstore;
    if (this.state.isChrome) {
      window.SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      this.state.recognition = new window.SpeechRecognition();

      this.state.recognition.interimResults = true;
      this.state.recognition.maxAlternatives = 10;
      this.state.recognition.continuous = true;

      this.state.recognition.onresult = event => {
        let interimTranscript = "";
        for (
          let i = event.resultIndex, len = event.results.length;
          i < len;
          i++
        ) {
          let transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.state.finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // console.log(finalTranscript + '<i style="color:#ddd;">' + interimTranscript + '</>'); FOR DEBUGING
        console.log(this.state.finalTranscript);
      };
    }
  }

  handleChange = (e, value) => {
    this.setState({ selectedAppointmentId: e.target.value });
  };

  handleEmployeeChange = (e, value) => {
    this.setState({ selectedEmployeeId: e.target.value });
  };

  handleTaskChange = (e, value) => {
    this.setState({ task_name: e.target.value });
  };

  handleTextChange = key => {
    return event => {
      this.setState({ [key]: event.target.value });
    };
  };

  get isAppointment() {
    return (
      this.state.selectedAppointmentId !== "" &&
      this.state.appointments[this.state.selectedAppointmentId]
    );
  }

  get currentAppointment() {
    return this.isAppointment
      ? this.state.appointments[this.state.selectedAppointmentId]
      : null;
  }

  get customerFirstName() {
    return this.isAppointment
      ? this.currentAppointment.firstName
      : this.state.firstName;
  }

  get customerLastName() {
    return this.isAppointment
      ? this.currentAppointment.lastName
      : this.state.lastName;
  }

  get customerPhone() {
    return this.isAppointment ? "(111)-222-3333" : this.state.phone;
  }

  handleCheckChange = key => {
    return el => {
      this.setState({ [key]: el.target.checked });
    };
  };

  onSubmit = () => {
    console.log(this.state.isRecording ? "listening" : "stopped listening");
    this.setState({ isRecording: !this.state.isRecording });
    if(this.state.isChrome){
        if (this.state.isRecording) {
            this.state.recognition.start();
          } else {
            this.state.recognition.stop();
            //    MAKE CALL TO GET THE LINKS
            fetch("http://13.68.142.20/add_task", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                speech: this.state.finalTranscript,
                language: this.state.language,
                employee: this.state.employee_id,
                task_name: this.state.task_name
              })
            }).then(resp => {
              //    make sure no error happened
              if (!resp.ok) {
                throw new Error("HTTP error, status = " + resp.status);
              }
            });
            this.setState({ finalTranscript: "" });
          }
    }
    else{
        fetch("http://13.68.142.20/add_task", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                speech: null,
                language: this.state.language,
                employee: this.state.selectedEmployeeId,
                task_name: this.state.task_name,
                  customer_name: (this.state.firstName + ' ' + this.state.lastName).trim(),
                  phone: this.state.phone,
              })
            }).then(resp => {
              //    make sure no error happened
              if (!resp.ok) {
                throw new Error("HTTP error, status = " + resp.status);
              }
            });
            this.setState({ finalTranscript: "" });
    }
  };

  render() {
    const { classes } = this.props;

    console.log(this.state);

    return (
      <div>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="appointment-simple">Appointment</InputLabel>
          <Select
            value={this.state.selectedAppointmentId}
            onChange={this.handleChange}
            inputProps={{
              name: "appointment",
              id: "appointment-simple"
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {this.state.appointments.map((item, i) => (
              <MenuItem key={item.id} value={i}>
                {item.firstName + " " + item.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="first-name"
          label="First Name"
          className={classes.textField}
          value={this.customerFirstName}
          onChange={this.handleTextChange("firstName")}
          disabled={this.isAppointment}
          margin="normal"
        />
        <TextField
          id="last-name"
          label="Last Name"
          className={classes.textField}
          value={this.customerLastName}
          onChange={this.handleTextChange("lastName")}
          disabled={this.isAppointment}
          margin="normal"
        />
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="formatted-text-mask-input">Phone</InputLabel>
          <Input
            value={this.customerPhone}
            onChange={this.handleTextChange("phone")}
            id="formatted-text-mask-input"
            inputComponent={TextMaskCustom}
            disabled={this.isAppointment}
          />
        </FormControl>
        <FormControl className={classes.wideFormControl}>
          <InputLabel htmlFor="employee-simple">Assign to Employee</InputLabel>
          <Select
            value={this.state.selectedEmployeeId}
            onChange={this.handleEmployeeChange}
            inputProps={{
              name: "employee",
              id: "employee-simple"
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {this.state.employees.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel htmlFor="u-simple">Issues</InputLabel>
          <Select
            value={this.state.task_name}
            onChange={this.handleTaskChange}
            inputProps={{
              name: "employee",
              id: "employee-simple"
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="accessory">
              Accessory
            </MenuItem>
            <MenuItem value="activate_service">
              Activate Service
            </MenuItem>
            <MenuItem value="activate_prepaid_service">
              Activate Prepaid Service
            </MenuItem>
            <MenuItem value="upgrade">
              Upgrade
            </MenuItem>
              <MenuItem value="sim">
                  SIM
              </MenuItem>
              <MenuItem value="bill_pay">
                  Bill Pay
              </MenuItem>
              <MenuItem value="insurance">
                  Insurance
              </MenuItem>
              <MenuItem value="just_looking">
                  Just Looking
              </MenuItem>
              <MenuItem value="return">
                  Return
              </MenuItem>
              <MenuItem value="service_account">
                  Service Account
              </MenuItem>
              <MenuItem value="service_device">
                  Service Device
              </MenuItem>
              <MenuItem value="t_mobile_tuesdays">
                    T-Mobile Tuesdays
              </MenuItem>

          </Select>
        </FormControl>
        <FormControl className={classes.wideFormControl}>
          <InputLabel htmlFor="employee-simple">
            Language Restrictions
          </InputLabel>
          <Select
            value={this.state.language}
            onChange={this.handleEmployeeChange}
            inputProps={{
              name: "employee",
              id: "employee-simple"
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Chinese">
              <em>Chinese</em>
            </MenuItem>
            <MenuItem value="French">
              <em>French</em>
            </MenuItem>
            <MenuItem value="Hindi">
              <em>Hindi</em>
            </MenuItem>
            <MenuItem value="Spanish">
              <em>Spanish</em>
            </MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={this.onSubmit}
          className={classes.button}
        >
          {this.state.isChrome ? "Voice Assistant" :" Submit" }
        </Button>
      </div>
    );
  }
}

AddToQueue.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AddToQueue);
