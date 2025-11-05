import { SelectQuery } from '../utils/db';

// get Weekly Summary of points for a given action
export async function getWeeklySummary(action: string) {
    // get number of days from each week where the action was performed, where week is Mon-Sun
    // output should be array of { weekStart: string, actionCount: number }
    const summary = await SelectQuery<{ weekStart: string, actionCount: number }>(`
        SELECT
            DATE_SUB(dayDate, INTERVAL WEEKDAY(dayDate) DAY) AS weekStart,
            COUNT(*) AS actionCount
        FROM (
            SELECT
            id,
            day,
            actions,
            DATE_ADD('2024-06-17', INTERVAL day DAY) AS dayDate
            FROM track_points
            WHERE INSTR(actions, ?) > 0
        ) AS actionDays
        GROUP BY weekStart
        ORDER BY weekStart DESC;
    `, [action]);

    if (summary.length === 0) return [];

    const weekMap = new Map(summary.map(s => [s.weekStart, s.actionCount]));

    const weeks = summary.map(s => new Date(s.weekStart)).sort((a, b) => a.getTime() - b.getTime());
    const minDate = weeks[0];
    const maxDate = new Date();

    const result: { weekStart: string; actionCount: number }[] = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 7)) {
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        result.push({
        weekStart: key,
        actionCount: weekMap.get(key) ?? 0,
        });
    }

    // Return in descending order
    return result.reverse();
}