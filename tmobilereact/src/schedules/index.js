
/*
[
  {
    "constraint_props": {
      "language": [
        "english"
      ],
      "name": [
        "Bob"
      ]
    },
    "current_task_end": 25899010.0,
    "default_proficiency": 1,
    "name": "Bob",
    "task_proficiencies": {},
    "uuid": "3"
  },
  {
    "constraint_props": {
      "language": [
        "english"
      ],
      "name": [
        "Bob"
      ]
    },
    "current_task_end": 25899010.0,
    "default_proficiency": 1,
    "name": "Bob",
    "task_proficiencies": {},
    "uuid": "4"
  }
]
 */
import App from "../App";

export class Employee {
    id;
    name;

    currentTaskEnd;
    currentTaskEndRaw;

    static fromJSON(raw) {
        const obj = new Employee();
        obj.id = raw.uuid;
        obj.name = raw.name;
        if (raw.current_task_end) {
            obj.currentTaskEnd = new Date(raw.current_task_end * 60 * 1000);
            obj.currentTaskEndRaw = raw.current_task_end;
        } else {
            obj.currentTaskEnd = null;
            obj.currentTaskEndRaw = null;
        }

        return obj;
    }


    get displayName() {
        return this.name;
    }
}

/*
{
  "0": [
    {
      "checkin_time": 25899016.0,
      "customer_name": "Kyle Stachowicz",
      "name": "sim",
      "online_time": null,
      "time_to_complete": 5,
      "uuid": "2"
    },
    {
      "checkin_time": 25899016.0,
      "customer_name": "Kyle Stachowicz",
      "name": "sim",
      "online_time": null,
      "time_to_complete": 5,
      "uuid": "4"
    }
  ],
  "1": [
    {
      "checkin_time": 25899016.0,
      "customer_name": "Kyle Stachowicz",
      "name": "sim",
      "online_time": null,
      "time_to_complete": 5,
      "uuid": "3"
    }
  ]
}

{
        id: 0,
        title: 'Board meeting',
        start: new Date(2019, 2, 30, 9, 0, 0),
        end: new Date(2019, 2, 30, 13, 0, 0),
        resourceId: 1,
    },
 */

export class ScheduleItem {
    id;
    title;
    description;
    start;
    end;

    employeeId;

    static fromJSON(raw) {
        const obj = new ScheduleItem();
        obj.id = raw.uuid;
        obj.title = raw.customer_name;
        obj.description = raw.name;
        obj.start = new Date(raw.start * 60 * 1000);
        obj.end = new Date(raw.end * 60 * 1000);
        obj.employeeId = raw.employee_id;

        return obj;
    }

    get resourceId() {
        return this.employeeId;
    }

}

export async function getEmployees() {
    const response = await fetch('http://13.68.142.20/get_workers');
    if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();

    return data.map(Employee.fromJSON);
}

export async function getSchedule() {
    const employees = await getEmployees();

    const employeeLookup = new Map();
    for (let employee of employees) {
        employeeLookup.set(employee.id, employee);
    }

    const response = await fetch('http://13.68.142.20/schedule');
    if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
    }
    const eventData = await response.json();

    const events = [];

    const now = new Date().getTime() / (60 * 1000);

    for (const eId of Object.keys(eventData)) {
        const employee = employeeLookup.get(eId);
        if (!employee) {
            throw new Error('Unknown employee id: ' + eId);
        }
        let nextAvailable = now;
        if (employee.currentTaskEndRaw && employee.currentTaskEndRaw > nextAvailable) {
            nextAvailable = employee.currentTaskEndRaw;
        }

        for (const event of eventData[eId]) {
            if (event.online_time) {
                event.start = Math.max(nextAvailable, event.online_time);
            } else {
                event.start = nextAvailable;
            }
            event.end = event.start + event.time_to_complete;
            nextAvailable = event.end + 2;
            event.employee_id = eId;

            events.push(ScheduleItem.fromJSON(event));
        }
    }


    return { employees, events };
}

/*
{
    "checkin_time": null,
    "constraints": {
      "language": "english"
    },
    "customer_name": "Ananth",
    "name": "coverage",
    "online_time": 25899100,
    "time_to_complete": 30,
    "uuid": "2"
  }
 */

export class Appointment {
    id;
    name;
    category;
    appointmentTime;

    static fromJSON(raw) {
        const obj = new Appointment();
        obj.id = raw.uuid;
        obj.name = raw.customer_name;
        obj.category = raw.name;
        obj.appointmentTime = new Date(raw.online_time * 60000);
        return obj;
    }

    get firstName() {
        const parts = this.name.split(" ");
        return parts[0];
    }

    get lastName() {
        const parts = this.name.split(" ");
        parts.shift();
        return parts.join(' ');
    }

}

export async function getAppointment() {
    const response = await fetch('http://13.68.142.20/get_appointments');
    if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
    }
    const data = await response.json();

    return data.map(Appointment.fromJSON);
}
