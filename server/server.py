from flask import Flask, jsonify, request
from flask_cors import CORS
import optimizer
from articles import parseRecuests
import time
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)

tasks = []
workers = []
current_schedule = optimizer.Schedule({})

alpha = 1e-2

task_times = {
    'accessory': 10,
    'activate_service': 20,
    'activate_prepaid_service': 15,
    'upgrade': 45,
    'sim': 10,
    'bill_pay': 5,
    'insurance': 30,
    'just_looking': 20,
    'return': 10,
    'service_account': 30,
    'service_device': 60,
    't_mobile_tuesdays': 1,
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
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'content-type,authorization')
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
    if not worker:
        response = jsonify(success=False)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    worker = worker[0]
    task = current_schedule.rep_assignments[worker]
    if not task:
        response = jsonify(success=False)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    task = task[0]
    tasks = [t for t in tasks if str(t.uuid) != str(task.uuid)]
    complete_task(my_uuid)
    worker.current_task = task
    worker.current_task_end = time.time() // 60 + task.time_to_complete
    update_schedule()
    response = jsonify(task.serialize())
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/complete_task", methods=['POST'])
def complete_task_stub():
    complete_task(request.get_json()['uuid'])
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'content-type,authorization')
    return response


def complete_task(my_uuid):
    worker = [w for w in workers if str(w.uuid) == str(my_uuid)]
    if not worker or not worker[0].current_task:
        response = jsonify(success=False)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    worker = worker[0]
    worker.num_customers_helped += 1
    time_to_complete = max(1, time.time() // 60 - (
        worker.current_task_end - worker.current_task.time_to_complete))
    ratio = worker.current_task.time_to_complete / time_to_complete
    previous_proficiency = worker.task_proficiencies[worker.current_task.task_name] if worker.current_task.task_name in worker.task_proficiencies else worker.default_proficiency
    worker.task_proficiencies[worker.current_task.task_name] = (1 - alpha) * previous_proficiency + alpha * ratio
    if worker.current_task:
        worker.current_task = None
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/schedule_appointment", methods=['POST'])
def schedule_appointment():
    global tasks
    tasks.append(optimizer.Task(
        request.get_json()['task_name'],
        request.get_json()['customer_name'],
        request.get_json()['phone'] if 'phone' in request.get_json() else '',
        task_times[request.get_json()['task_name']],
        None,
        request.get_json()['time'],
        constraints={"language": request.get_json()['language']},
    ))
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'content-type,authorization')
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
        request.get_json()['phone'] if 'phone' in request.get_json() else '',
        task_times[request.get_json()['task_name']],
        time.time() // 60,
        None,
        constraints=constraints,
        recommmended=parseRecuests(request.get_json()['speech']) if 'speech' in request.get_json() and request.get_json['speech'],
    ))
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'content-type,authorization')
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
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    response.headers.add('Access-Control-Allow-Headers', 'content-type,authorization')
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


@app.route("/activate_rep", methods=['POST'])
def activate_rep():
    global workers
    uuid = request.get_json()['uuid']
    [w for w in workers if w.uuid == uuid][0].active = True
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/deactivate_rep", methods=['POST'])
def deactivate_rep():
    global workers
    uuid = request.get_json()['uuid']
    [w for w in workers if w.uuid == uuid][0].active = False
    complete_task([w for w in workers if w.uuid == uuid][0].uuid)
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/statistics", methods=['GET'])
def statistics():
    global workers
    response = jsonify({
            w.name: {
                'proficiencies': {t: w.score(t) for t in task_times.keys()},
                'num_customers_helped': w.num_customers_helped,
            } for w in workers
        })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/cancel", methods=['POST'])
def cancel_task():
    global tasks
    uuid = request.get_json()['task_uuid']
    tasks = [t for t in tasks if t.uuid != uuid]
    for w in workers:
        if w.current_task is not None and w.current_task.uuid == uuid:
            w.current_task = None
            w.current_task_end = time.time() // 60
    update_schedule()
    response = jsonify(success=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


tasks.append(optimizer.Task(
    "sim",
    "Will",
    "6666666666",
    5,
    time.time() // 60,
    None,
    constraints={"language": "english"},
))
tasks.append(optimizer.Task(
    "service_device",
    "Ananth",
    "1111111111",
    60,
    None,
    time.time() // 60 + 15,
    constraints={"language": "english"},
))

workers.append(optimizer.Worker(
    "Naman",
    time.time() // 60
))
workers.append(optimizer.Worker(
    "Kyle",
    time.time() // 60
))
for w in workers:
    w.active = True
update_schedule()


sched = BackgroundScheduler(daemon=True)
sched.add_job(update_schedule, 'interval', seconds=10)
sched.start()
