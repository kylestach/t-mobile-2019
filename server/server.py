from flask import Flask, jsonify, request
import optimizer
import time
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

tasks = []
workers = []
current_schedule = optimizer.Schedule({})

task_times = {
    'coverage': 30,
    'problem': 40,
    'upgrade': 50,
    'add': 60,
    'sim': 5,
    'features': 15,
    'accessories': 20,
    'help': 20,
    'other': 20,
}


@app.route("/add_worker", methods=['POST'])
def add_worker():
    global workers
    workers.append(optimizer.Worker(
        request.get_json()['name'],
        time.time() // 60
    ))
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/get_workers", methods=['GET'])
def get_workers():
    response = jsonify([w.serialize() for w in workers])
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/pull_task/<my_uuid>", methods=['GET'])
def pull_latest_task(my_uuid):
    global current_schedule
    global tasks
    worker = [w for w in workers if str(w.uuid) == str(my_uuid)]
    print(worker, my_uuid)
    if not worker:
        response = jsonify(success=False)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    worker = worker[0]
    task = current_schedule.rep_assignments[worker][0]
    tasks = [t for t in tasks if str(t.uuid) != str(task.uuid)]
    worker.current_task = task
    worker.current_task_end = time.time() // 60 + task.time_to_complete
    update_schedule()
    response = jsonify(task.serialize())
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/schedule_appointment", methods=['POST'])
def schedule_appointment():
    global tasks
    tasks.append(optimizer.Task(
        request.get_json()['task_name'],
        request.get_json()['customer_name'],
        task_times[request.get_json()['task_name']],
        None,
        request.get_json()['time'],
        constraints={"language": request.get_json()['language']},
    ))
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/add_task", methods=['POST'])
def add_task():
    global tasks
    constraints = {"language": request.get_json()['language']}
    if "employee" in request.get_json():
        constraints["employee_uuid"] = request.get_json()["employee"]
    tasks.append(optimizer.Task(
        request.get_json()['task_name'],
        request.get_json()['customer_name'],
        task_times[request.get_json()['task_name']],
        time.time() // 60,
        None,
        constraints=constraints,
    ))
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/get_appointments", methods=['GET'])
def get_appointments():
    response = jsonify([
        t.serialize() for t in sorted(
            [t for t in tasks if t.online_time is not None],
            key=lambda t: t.online_time)])
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/get_tasks", methods=['GET'])
def get_tasks():
    response = jsonify([t.serialize() for t in tasks])
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/check_in", methods=['POST'])
def checkin_appointment():
    uuid = request.get_json()['uuid']
    filtered = [t for t in tasks if str(t.uuid) == str(uuid)]
    filtered.checkin_time = time.time() // 60
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route("/schedule", methods=['GET'])
def get_schedule():
    global current_schedule
    response = jsonify(current_schedule.serialize())
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def update_schedule():
    print("Updating schedule...")
    global current_schedule
    current_schedule = optimizer.optimize_schedule(
        tasks, workers, time.time() // 60)


sched = BackgroundScheduler(daemon=True)
sched.add_job(update_schedule, 'interval', seconds=10)
sched.start()
