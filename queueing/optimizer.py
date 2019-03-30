import math
import random
import itertools

R = 1.0
K = 1.0

class Task:
    def __init__(self,
                 time_to_complete,
                 checkin_time=None,
                 online_time=None,
                 language="english"):
        self.time_to_complete = time_to_complete
        self.checkin_time = checkin_time
        self.online_time = online_time
        self.language = language

    def eval_cost(self, worker, time, now_time):
        zeta = None
        target_time = None
        if self.language not in worker.languages:
            return float('inf')

        if self.online_time is not None:
            # If it's scheduled before the appointment, it's a failure
            if time < self.online_time:
                return float('inf')
            zeta = K * math.exp(R * max(0, self.online_time - now_time))
            target_time = self.online_time
        else:
            zeta = 0
            target_time = self.checkin_time
        time_err = max(0, time - target_time)
        return time_err * (time_err + zeta)

    def __repr__(self):
        return "%s" % self.time_to_complete


class Worker:
    def __init__(self, name, languages, current_task_end):
        self.name = name
        self.languages = languages
        self.current_task_end = current_task_end


class Schedule:
    def __init__(self, rep_assignments):
        self.rep_assignments = rep_assignments

    def eval_cost(self, now_time):
        cost = 0
        for worker in self.rep_assignments:
            schedule_time = worker.current_task_end
            tasks = self.rep_assignments[worker]
            for task in tasks:
                # If this task is online, delay it until the proper start time.
                if task.online_time is not None and schedule_time < task.online_time:
                    schedule_time = task.online_time
                cost += task.eval_cost(worker, schedule_time, now_time)
                schedule_time += task.time_to_complete
            cost += schedule_time ** 2
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
    default_assignments = {r: [] for r in reps}
    for r, t in zip(itertools.cycle(reps), tasks):
        default_assignments[r].append(t)

    schedule = Schedule(default_assignments)

    best_so_far = schedule
    best_cost = best_so_far.eval_cost(now_time)

    num_iterations = 1000
    prev_cost = schedule.eval_cost(now_time)

    for i in range(num_iterations):
        T = 0.9999 ** i
        next_neighbor = schedule.gen_neighbor(int(max(1, len(tasks) * T)))
        new_cost = next_neighbor.eval_cost(now_time)
        # print(new_cost, prev_cost)
        if new_cost < prev_cost or math.exp(-1e-3 * (new_cost - prev_cost) / T) >= random.random():
            schedule = next_neighbor
            prev_cost = new_cost

        if new_cost < best_cost:
            best_so_far = schedule
            best_cost = new_cost

    print(best_cost, best_so_far.rep_assignments)

def main():
    tasks = [Task(15, 0), Task(10, 0), Task(50, 0), Task(30, 0), Task(30, 0), Task(25, 0), Task(31, None, 25, "spanish")]
    reps = [
        Worker("A", ["english"], 0),
        Worker("B", ["english"], 0),
        Worker("C", ["english", "spanish"], 0)]
    optimize_schedule(tasks, reps, 0)

if __name__ == '__main__':
    main()
