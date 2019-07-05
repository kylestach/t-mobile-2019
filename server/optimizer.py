import math
import random
import itertools

R = 1e-1
K = 2.0

global_uuid = 0

def new_global_uuid():
    global global_uuid
    result = global_uuid
    global_uuid += 1
    return str(result)

class Task:
    def __init__(self,
                 task_name,
                 customer_name,
                 customer_phone,
                 time_to_complete,
                 checkin_time=None,
                 online_time=None,
                 constraints={"language": "english"}, recommended=[]):
        self.task_name = task_name
        self.customer_name = customer_name
        self.customer_phone = customer_phone
        self.time_to_complete = time_to_complete
        self.checkin_time = checkin_time
        self.online_time = online_time
        self.constraints = constraints.copy()
        self.uuid = new_global_uuid()
        self.recommended = recommended

    def eval_cost(self, worker, time, now_time):
        zeta = None
        target_time = None
        if not worker.matches_hard_constraints(self.constraints):
            return 1e10

        if self.online_time is not None:
            # If it's scheduled before the appointment, it's a failure
            if time < self.online_time:
                return float('inf')
            if self.checkin_time is None:
                zeta = K * math.exp(R * min(0, self.online_time - now_time))
                target_time = self.online_time
            else:
                zeta = K
                target_time = max(self.online_time, self.checkin_time)
        else:
            zeta = 0
            target_time = self.checkin_time
        time_err = max(0, time - target_time)
        return time_err * (time_err * (zeta + 1))

    def serialize(self):
        return {
            "name": self.task_name,
            "customer_name": self.customer_name,
            "time_to_complete": self.time_to_complete,
            "checkin_time": self.checkin_time,
            "online_time": self.online_time,
            "uuid": self.uuid,
            "constraints": self.constraints,
            "phone": self.customer_phone,
            "recommended": self.recommended,
        }

    def __repr__(self):
        return "%s: %s" % (self.task_name, self.time_to_complete)


class Worker:
    def __init__(self, name, current_task_end,
                 default_proficiency=1, task_proficiencies={},
                 constraint_props={"language": ["english"]}):
        self.name = name
        self.current_task_end = current_task_end
        self.default_proficiency = default_proficiency
        self.task_proficiencies = task_proficiencies
        self.constraint_props = constraint_props.copy()
        self.uuid = new_global_uuid()
        self.constraint_props["employee_uuid"] = [self.uuid]
        self.current_task = None
        self.active = False
        self.num_customers_helped = 0

    def score(self, task_name):
        return self.task_proficiencies[task_name] if task_name in self.task_proficiencies else self.default_proficiency

    def matches_hard_constraints(self, constraints):
        for key in constraints.keys():
            if key not in self.constraint_props or constraints[key] not in self.constraint_props[key]:
                return False
        return True

    def serialize(self):
        return {
            "name": self.name,
            "current_task_end": self.current_task_end,
            "current_task": self.current_task.serialize() if self.current_task else None,
            "default_proficiency": self.default_proficiency,
            "task_proficiencies": self.task_proficiencies,
            "constraint_props": self.constraint_props,
            "uuid": self.uuid,
            "active": self.active,
        }


class Schedule:
    def __init__(self, rep_assignments):
        self.rep_assignments = rep_assignments

    def serialize(self):
        return {
            str(rep.uuid): [t.serialize() for t in tasks]
            for rep, tasks in self.rep_assignments.items()}

    def eval_cost(self, now_time):
        cost = 0
        for worker in self.rep_assignments:
            schedule_begin = max(worker.current_task_end, now_time)
            schedule_time = schedule_begin
            tasks = self.rep_assignments[worker]
            for task in tasks:
                # If this task is online, delay it until the proper start time.
                if task.online_time is not None and schedule_time < task.online_time:
                    schedule_time = task.online_time
                cost += task.eval_cost(worker, schedule_time, now_time)
                schedule_time += task.time_to_complete / worker.score(task.task_name)
                schedule_time += 2
            cost += (schedule_time - schedule_begin) ** 2
        return cost

    def gen_neighbor(self, num_moves):
        new_rep_assignments = self.rep_assignments.copy()
        num_tasks = sum(len(t) for _, t in self.rep_assignments.items())
        for _ in range(num_moves):
            item_to_remove = random.randint(0, num_tasks - 1)
            for rep, tasks in new_rep_assignments.items():
                if item_to_remove < len(tasks):
                    removed_task = new_rep_assignments[rep][item_to_remove]
                    new_rep_assignments[rep] = [
                        x for i, x in enumerate(tasks) if i != item_to_remove
                    ]
                    # Add removed_task somewhere
                    new_rep = random.choice(list(new_rep_assignments.keys()))
                    new_idx = random.randint(
                        0, len(new_rep_assignments[new_rep]))
                    new_rep_assignments[new_rep] = (
                        new_rep_assignments[new_rep][:new_idx] +
                        [removed_task] +
                        new_rep_assignments[new_rep][new_idx:])
                    break
                else:
                    item_to_remove -= len(tasks)
        return Schedule(new_rep_assignments)


def optimize_schedule(tasks, reps, now_time):
    reps = [rep for rep in reps if rep.active]
    default_assignments = {r: [] for r in reps}
    for r, t in zip(itertools.cycle(reps), tasks):
        default_assignments[r].append(t)

    schedule = Schedule(default_assignments)

    if not tasks or not reps:
        return schedule

    best_so_far = schedule
    best_cost = best_so_far.eval_cost(now_time)

    num_iterations = 10000
    prev_cost = schedule.eval_cost(now_time)

    for i in range(num_iterations):
        if random.random() < 1e-2:
            schedule = best_so_far
            prev_cost = best_cost

        T = 0.9999 ** i
        next_neighbor = schedule.gen_neighbor(random.randint(1, max(1, int(T * len(tasks) / 2 + 0.5), 1)))
        new_cost = next_neighbor.eval_cost(now_time)
        if new_cost < prev_cost or math.exp(-1e-3 * (new_cost - prev_cost) / T) >= random.random():
            schedule = next_neighbor
            prev_cost = new_cost

        if new_cost < best_cost:
            best_so_far = schedule
            best_cost = new_cost

    # print("Optimization finished with cost %s" % best_cost)
    return best_so_far

def simulate_random_tasks(N):
    tasks = []
    in_progress = [None, None, None]
    queue = []
    times = [5] * 10 + [10] * 6 + [15] * 4 + [20] * 2 + [30, 45, 60]
    t = 0
    wait_times = []
    for i in range(N):
        if random.random() < 0.4:
            queue.append(Task(str(i), 'a', "", random.choice(times), t))
        for i in range(len(in_progress)):
            if in_progress[i] and in_progress[i][0] + in_progress[i][1].time_to_complete <= t:
                in_progress[i] = None

            if not in_progress[i]:
                if queue:
                    in_progress[i] = (t, queue[0])
                    wait_times.append(t - in_progress[i][1].checkin_time)
                    queue = queue[1:]
        # Check in a new task
        t += 1

    while queue or in_progress[0] or in_progress[1] or in_progress[1]:
        for i in range(len(in_progress)):
            if in_progress[i] and in_progress[i][0] + in_progress[i][1].time_to_complete <= t:
                in_progress[i] = None

            if not in_progress[i]:
                if queue:
                    in_progress[i] = (t, queue[0])
                    wait_times.append(t - in_progress[i][1].checkin_time)
                    queue = queue[1:]
        # Check in a new task
        t += 1
    # print("Median: %s" % sorted(wait_times)[len(wait_times)//2])
    # print("Mean: %s" % (sum(wait_times)/len(wait_times)))
    wait_times.sort()
    if len(wait_times) > 2:
        print("%s, %s" % (N, wait_times[len(wait_times)//2]))

def simulate_random_tasks_enhanced(N):
    in_progress = [None, None, None]
    tasks = []
    times = [5] * 10 + [10] * 6 + [15] * 4 + [20] * 2 + [30, 45, 60]
    t = 0
    wait_times = []
    reps = [Worker("a", 0), Worker("b", 0), Worker("c", 0)]
    for r in reps:
        r.active = True

    for i in range(N):
        if random.random() < 0.4:
            tasks.append(Task(str(i), 'a', "", random.choice(times), t))
        for i in range(len(in_progress)):
            if in_progress[i] and in_progress[i][0] + in_progress[i][1].time_to_complete <= t:
                in_progress[i] = None

            if not in_progress[i]:
                if tasks:
                    schedule = optimize_schedule(tasks, reps, t)
                    if schedule.rep_assignments[reps[i]]:
                        task = schedule.rep_assignments[reps[i]][0]
                        in_progress[i] = (t, task)
                        tasks = [t for t in tasks if t.uuid != task.uuid]
                        wait_times.append(t - in_progress[i][1].checkin_time)
        # Check in a new task
        t += 1

    while tasks or in_progress[0] or in_progress[1] or in_progress[1]:
        for i in range(len(in_progress)):
            if in_progress[i] and in_progress[i][0] + in_progress[i][1].time_to_complete <= t:
                in_progress[i] = None

            if not in_progress[i]:
                if tasks:
                    schedule = optimize_schedule(tasks, reps, t)
                    if schedule.rep_assignments[reps[i]]:
                        task = schedule.rep_assignments[reps[i]][0]
                        in_progress[i] = (t, task)
                        tasks = [t for t in tasks if t.uuid != task.uuid]
                        wait_times.append(t - in_progress[i][1].checkin_time)
        # Check in a new task
        t += 1
    # print("Median: %s for %s tasks" % (sorted(wait_times)[len(wait_times)//2], i))
    # print("Mean: %s for %s tasks" % (sum(wait_times)/len(wait_times), i))
    wait_times.sort()
    if len(wait_times) > 2:
        print("%s, %s" % (N, wait_times[len(wait_times)//2]))

def main():
    for i in range(50, 100):
        for _ in range(3):
            simulate_random_tasks(i)
    print('-------------')
    for i in range(50, 100):
        for _ in range(3):
            simulate_random_tasks_enhanced(i)
    # tasks = [Task(15, 0), Task(10, 0), Task(50, 0), Task(30, 0), Task(30, 0), Task(25, 0), Task(31, None, 25, "spanish")]
    tasks = [Task("sim", "bob", "", 25, 0)] * 30 + [Task("sell", "alice", "", 60, 0)] * 15 + [Task("THING C", "eve", "", 30, 0, 15, constraints={"language": "spanish"})]
    random.shuffle(tasks)
    reps = [
        Worker("A", 0, task_proficiencies={"sim": 1.5}),
        Worker("B", 0, task_proficiencies={"sell": 1.3}),
        Worker("C", 0, constraint_props={"language": ["english", "spanish"]})]
    for r in reps:
        r.active = True
    print(optimize_schedule(tasks, reps, 40.).rep_assignments)

if __name__ == '__main__':
    main()
