import JSZip from 'jszip';

export interface ProgressCallback {
    (stage: 'extracting' | 'parsing' | 'analyzing', message: string, stats?: {
        workouts?: number;
        sleepSessions?: number;
        steps?: number;
    }): void;
}

export interface HealthData {
    steps: any[];
    exercises: any[];
    sleep: any[];
    heartRate: any[];
    stress: any[];
    oxygenSaturation: any[];
    hrv: any[];
    binningData: Record<string, any[]>;
}

export interface WorkoutRecord {
    type: string;
    duration: number; // minutes
    calories: number;
    distance?: number; // km
    avgHR?: number;
    maxHR?: number;
    avgSpeed?: number;
    startTime: string;
    date: string;
}

export interface YearStats {
    year: string;
    totalSteps: number;
    dailyAvg: number;
    totalCalories: number;
    totalDistance: number;
    avgSpeed: number;
    bestDay: { count: number; date: string };
    bestMonth: { name: string; steps: number };
    monthlyTrends: { month: string; steps: number }[];
    topExercises: { name: string; count: number }[];
    avgSleepDuration: number;
    avgEfficiency: number;
    avgSleepScore: number;
    avgBedTime: string;
    avgWakeTime: string;
    totalWorkouts: number;
    avgRestingHR: number;
    avgHRV: number;
    avgStress: number;
    minSpO2: number;
    heartRate: { time: string; heartRate: number }[];
    stress: { time: string; score: number }[];
    dailyStepData: { date: string; count: number }[];
    dailySleepData: { date: string; duration: number }[];
    dailySleepScoreData: { date: string; score: number }[];
    dailyHRData: { date: string; value: number }[];
    dailyHRVData: { date: string; value: number }[];
    dailyStressData: { date: string; value: number }[];
    dailySpO2Data: { date: string; value: number }[];
    workouts: WorkoutRecord[];
    totalWorkoutDuration: number; // total minutes
    totalWorkoutCalories: number;
    totalWorkoutDistance: number;
    dailyWorkoutData: { date: string; duration: number; calories: number; distance: number }[];

    // Personal Records
    personalRecords: {
        mostStepsDay: { count: number; date: string };
        longestWorkout: { duration: number; type: string; date: string };
        bestSleepScore: { score: number; date: string };
        mostActiveWeek: { steps: number; weekStart: string };
        longestStreak: { days: number; endDate: string };
    };

    // Weekday Analysis
    weekdayStats: {
        day: string;
        avgSteps: number;
        avgWorkouts: number;
        avgSleep: number;
        avgStress: number;
    }[];

    // Monthly Trends (enhanced)
    monthlyComparison: {
        month: string;
        steps: number;
        workouts: number;
        sleep: number;
        trend: 'up' | 'down' | 'stable';
        changePercent: number;
    }[];

    // Seasonal Patterns
    seasonalData: {
        season: 'Q1' | 'Q2' | 'Q3' | 'Q4';
        avgSteps: number;
        avgWorkouts: number;
        avgSleep: number;
        topActivity: string;
    }[];

    // Correlations
    correlations: {
        sleepVsActivity: number; // correlation coefficient
        stressVsWorkouts: number;
        hrVsSleep: number;
    };

    // Wrapped Insights
    wrappedInsights: {
        personality: {
            fitnessType: 'Early Bird' | 'Night Owl' | 'Balanced';
            workoutStyle: 'Weekend Warrior' | 'Consistent Grinder' | 'Casual';
            sleepArchetype: 'Consistent Sleeper' | 'Night Owl' | 'Early Riser' | 'Variable';
        };
        nicheStats: {
            marathonsWalked: number;
            caloriesInPizzas: number;
            sleepDaysTotal: number;
            mostActiveHour: number;
            favoriteWorkoutDay: string;
            longestStreak: number;
        };
        funComparisons: {
            distanceEquivalent: string; // e.g., "3 trips around Central Park"
            calorieEquivalent: string; // e.g., "245 pizzas"
            sleepEquivalent: string; // e.g., "15 full days"
        };
        patterns: {
            mostProductiveMonth: string;
            bestWorkoutTime: string;
            sleepQualityTrend: 'improving' | 'stable' | 'declining';
        };
    };
}

const EXERCISE_TYPES: Record<number, string> = {
    0: 'Workout',
    1001: 'Walking',
    1002: 'Running',
    11007: 'Cycling',
    13001: 'Hiking',
    14001: 'Swimming',
    15001: 'Yoga',
    11008: 'Mountain biking',
    10001: 'Bench Press',
    10009: 'Leg Extension',
    10012: 'Strength Training',
    10015: 'Squats',
    12001: 'Pilates',
    17001: 'Circuit Training',
};

const splitCSVLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return result;
};

const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // Find the header line: must contain keywords AND have more than 5 columns
    let headerLineIndex = -1;
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        const columns = splitCSVLine(line);

        if (columns.length > 5 && (
            lowerLine.includes('date') || lowerLine.includes('time') ||
            lowerLine.includes('count') || lowerLine.includes('efficiency') ||
            lowerLine.includes('duration') || lowerLine.includes('step')
        )) {
            headerLineIndex = i;
            break;
        }
    }

    if (headerLineIndex === -1) {
        headerLineIndex = lines.findIndex(l => splitCSVLine(l).length > 5);
        if (headerLineIndex === -1) return [];
    }

    const headers = splitCSVLine(lines[headerLineIndex]);

    const result: any[] = [];
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = splitCSVLine(line);
        // Relaxed length check: Must have at least as many columns as headers
        if (values.length < headers.length) continue;

        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = values[index];
        });
        result.push(obj);
    }
    return result;
};

export const parseSamsungHealthZip = async (file: File, onProgress?: ProgressCallback): Promise<HealthData> => {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const data: HealthData = {
        steps: [],
        exercises: [],
        sleep: [],
        heartRate: [],
        stress: [],
        oxygenSaturation: [],
        hrv: [],
        binningData: {},
    };

    const jsonMap: Record<string, string> = {};
    for (const path of Object.keys(contents.files)) {
        if (path.endsWith('.json')) {
            const parts = path.split('/');
            const fileName = parts[parts.length - 1];
            jsonMap[fileName] = path;
        }
    }

    onProgress?.('extracting', 'ZIP file extracted successfully');


    for (const [path, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue;

        const lowerPath = path.toLowerCase();


        if (lowerPath.includes('step') && lowerPath.includes('trend') && lowerPath.endsWith('.csv')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.steps = [...data.steps, ...parsed];
            onProgress?.('parsing', 'Analyzing step data', { steps: data.steps.length });

        } else if (lowerPath.includes('exercise') && lowerPath.endsWith('.csv') &&
            !lowerPath.includes('custom_exercise') &&
            !lowerPath.includes('weather') &&
            !lowerPath.includes('location_data') &&
            !lowerPath.includes('live_data')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.exercises = [...data.exercises, ...parsed];
            onProgress?.('parsing', 'Discovering workouts', { workouts: data.exercises.length });

        } else if (lowerPath.includes('sleep') && lowerPath.endsWith('.csv')) {
            // Take sleep summary files but avoid obvious detail/stage data
            const isDetail = lowerPath.includes('stage') || lowerPath.includes('alarm') || lowerPath.includes('log') || lowerPath.includes('data_source') || lowerPath.includes('raw');

            if (!isDetail) {
                const content = await zipEntry.async('text');
                const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
                data.sleep = [...data.sleep, ...parsed];
                onProgress?.('parsing', 'Analyzing sleep patterns', { sleepSessions: data.sleep.length });

            }
        } else if (lowerPath.includes('heart_rate') && lowerPath.endsWith('.csv')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.heartRate = [...data.heartRate, ...parsed];

            // Collect referenced binning data
            for (const record of parsed) {
                const binFileName = record.binning_data || record['com.samsung.health.heart_rate.binning_data'];
                if (binFileName && jsonMap[binFileName] && !data.binningData[binFileName]) {
                    const jsonPath = jsonMap[binFileName];
                    const jsonContent = await contents.files[jsonPath].async('text');
                    try {
                        data.binningData[binFileName] = JSON.parse(jsonContent);
                    } catch (e) {
                        console.error('Failed to parse HR binning JSON:', binFileName, e);
                    }
                }
            }
        } else if (lowerPath.includes('stress') && lowerPath.endsWith('.csv') && !lowerPath.includes('histogram')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.stress = [...data.stress, ...parsed];

            // Collect referenced binning data
            for (const record of parsed) {
                const binFileName = record.binning_data || record['com.samsung.health.stress.binning_data'];
                if (binFileName && jsonMap[binFileName] && !data.binningData[binFileName]) {
                    const jsonPath = jsonMap[binFileName];
                    const jsonContent = await contents.files[jsonPath].async('text');
                    try {
                        data.binningData[binFileName] = JSON.parse(jsonContent);
                    } catch (e) {
                        console.error('Failed to parse Stress binning JSON:', binFileName, e);
                    }
                }
            }
        } else if (lowerPath.includes('oxygen_saturation') && lowerPath.endsWith('.csv')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.oxygenSaturation = [...data.oxygenSaturation, ...parsed];
        } else if (lowerPath.includes('hrv') && lowerPath.endsWith('.csv')) {
            const content = await zipEntry.async('text');
            const parsed = parseCSV(content).map(r => ({ ...r, _fileName: path }));
            data.hrv = [...data.hrv, ...parsed];

            // HRV binning data
            for (const record of parsed) {
                const binFileName = record.binning_data;
                if (binFileName && jsonMap[binFileName] && !data.binningData[binFileName]) {
                    const jsonPath = jsonMap[binFileName];
                    const jsonContent = await contents.files[jsonPath].async('text');
                    try {
                        data.binningData[binFileName] = JSON.parse(jsonContent);
                    } catch (e) {
                        console.error('Failed to parse HRV binning JSON:', binFileName, e);
                    }
                }
            }
        }
    }

    return data;
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const calculateCircularAverage = (minutesArray: number[]) => {
    if (minutesArray.length === 0) return 0;
    let sinSum = 0;
    let cosSum = 0;
    minutesArray.forEach(m => {
        const angle = (m / 1440) * 2 * Math.PI;
        sinSum += Math.sin(angle);
        cosSum += Math.cos(angle);
    });
    let avgAngle = Math.atan2(sinSum / minutesArray.length, cosSum / minutesArray.length);
    if (avgAngle < 0) avgAngle += 2 * Math.PI;
    return (avgAngle / (2 * Math.PI)) * 1440;
};

const formatToHHmm = (minutes: number) => {
    if (minutes === 0) return '--:--';
    const h = Math.floor(minutes / 60) % 24;
    const m = Math.round(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const parseOffset = (offsetStr: string): number => {
    if (!offsetStr) return 0;
    // Format is like "UTC+0530" or "+0530" or "GMT+05:30"
    const match = offsetStr.match(/[+-](\d{2}):?(\d{2})/);
    if (!match) return 0;
    const sign = offsetStr.includes('-') ? -1 : 1;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return sign * (hours * 60 + minutes);
};

// Calculate Pearson correlation coefficient
const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
};

// Get day of week name
const getDayName = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

export const transformHealthData = (data: HealthData): Record<string, YearStats> => {
    // Higher quality global dedup: Group sessions that overlap
    const enrichedSleep = data.sleep.map(s => {
        const offsetStr = s.time_offset || s['com.samsung.health.sleep.time_offset'] || '';
        const offsetMinutes = parseOffset(offsetStr);

        const startTime = s['com.samsung.health.sleep.start_time'] || s.start_time || s.update_time;
        const endTime = s['com.samsung.health.sleep.end_time'] || s.end_time;
        const fileName = s._fileName || '';
        const isCombined = fileName.toLowerCase().includes('combined');

        let rawDuration = parseFloat(s.sleep_duration) || parseFloat(s['com.samsung.health.sleep.duration']) || parseFloat(s.duration) || 0;
        if (rawDuration > 1440) rawDuration = rawDuration / 60000;

        // Force UTC parsing to avoid local browser interference
        const start = new Date(startTime.includes('Z') ? startTime : startTime.replace(' ', 'T') + 'Z');
        let end = new Date(endTime ? (endTime.includes('Z') ? endTime : endTime.replace(' ', 'T') + 'Z') : 0);

        if (isNaN(start.getTime())) return null;

        // Apply timezone offset to get local time
        const localStart = new Date(start.getTime() + offsetMinutes * 60000);
        let localEnd = new Date(end.getTime() + offsetMinutes * 60000);

        if (isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
            localEnd = new Date(localStart.getTime() + rawDuration * 60000);
        } else if (rawDuration === 0) {
            rawDuration = (end.getTime() - start.getTime()) / 60000;
        }

        let efficiency = parseFloat(s.efficiency) || parseFloat(s['com.samsung.health.sleep.efficiency']) || 0;
        if (efficiency > 0 && efficiency <= 1) efficiency *= 100;

        let sleepScore = parseFloat(s.sleep_score) || parseFloat(s['com.samsung.health.sleep.sleep_score']) || 0;

        // ACCURACY FIX: 
        // In 'combined' files, 'sleep_duration' IS the actual asleep time.
        // In 'sleep' files, 'sleep_duration' is often 'total time in bed'.
        let asleepTime = rawDuration;
        if (!isCombined && efficiency > 0 && efficiency < 100) {
            // If it looks like 'total time in bed' (span matches duration), apply efficiency
            const span = (end.getTime() - start.getTime()) / 60000;
            if (Math.abs(span - rawDuration) < 5) {
                asleepTime = rawDuration * (efficiency / 100);
            }
        }

        return {
            ...s,
            _start: localStart.getTime(),
            _end: localEnd.getTime(),
            _duration: asleepTime,
            _rawDuration: rawDuration,
            _efficiency: efficiency,
            _score: sleepScore,
            _isCombined: isCombined
        };
    }).filter(s => s !== null && s._duration > 0) as any[];

    // Sort by priority: Combined first, then longest duration
    enrichedSleep.sort((a, b) => {
        if (a._isCombined && !b._isCombined) return -1;
        if (!a._isCombined && b._isCombined) return 1;
        return b._duration - a._duration;
    });

    const keptSleep: any[] = [];
    enrichedSleep.forEach(record => {
        const isEncapsulated = keptSleep.some(kept => {
            const overlapStart = Math.max(record._start, kept._start);
            const overlapEnd = Math.min(record._end, kept._end);
            const overlapDuration = Math.max(0, overlapEnd - overlapStart) / 60000;

            // If more than 80% is covered, it's redundant
            return (overlapDuration / record._duration) > 0.8;
        });

        if (!isEncapsulated) {
            keptSleep.push(record);
        }
    });

    const processedSleep = keptSleep;


    // Discover years from BOTH steps and sleep data
    const yearSet = new Set<number>();

    data.steps.forEach(s => {
        const date = s.day_time ? new Date(parseInt(s.day_time)) : new Date(s.update_time);
        if (!isNaN(date.getFullYear())) yearSet.add(date.getFullYear());
    });

    processedSleep.forEach(s => {
        const date = new Date(s._start);
        if (!isNaN(date.getFullYear())) yearSet.add(date.getFullYear());
    });

    data.heartRate.forEach(hr => {
        const date = new Date(hr.start_time);
        if (!isNaN(date.getFullYear())) yearSet.add(date.getFullYear());
    });

    data.hrv.forEach(h => {
        const date = new Date(h.start_time);
        if (!isNaN(date.getFullYear())) yearSet.add(date.getFullYear());
    });

    data.exercises.forEach(e => {
        const startTime = e['com.samsung.health.exercise.start_time'] || e.start_time;
        if (startTime) {
            const date = new Date(startTime);
            if (!isNaN(date.getFullYear())) yearSet.add(date.getFullYear());
        }
    });

    const years = Array.from(yearSet).sort().map(String);


    if (years.length === 0) {
        console.warn('No years discovered from data. Check date formats.');
        return {};
    }

    const result: Record<string, YearStats> = {};

    years.forEach(year => {
        const yearInt = parseInt(year);
        const yearSteps = data.steps.filter(s => {
            const date = s.day_time ? new Date(parseInt(s.day_time)) : new Date(s.update_time);
            const matchesYear = date.getFullYear() === yearInt;
            const matchesSource = s.source_type === '-2' || !s.source_type; // Fail-safe
            return matchesYear && matchesSource;
        });


        const totalSteps = yearSteps.reduce((sum, s) => sum + (parseInt(s.count) || 0), 0);
        const totalCalories = yearSteps.reduce((sum, s) => sum + (parseFloat(s.calorie) || 0), 0);
        const totalDistance = yearSteps.reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0);

        const activeDays = yearSteps.filter(s => parseFloat(s.speed) > 0);
        const avgSpeed = activeDays.length > 0
            ? activeDays.reduce((sum, s) => sum + parseFloat(s.speed), 0) / activeDays.length
            : 0;

        const bestDay = yearSteps.reduce((best, s) => {
            const count = parseInt(s.count) || 0;
            return count > (best.count || 0) ? { count, date: s.update_time?.split(' ')[0] } : best;
        }, { count: 0, date: '' });

        const monthlySteps: Record<string, number> = {};
        yearSteps.forEach(s => {
            const date = s.day_time ? new Date(parseInt(s.day_time)) : new Date(s.update_time);
            const month = monthNames[date.getMonth()];
            monthlySteps[month] = (monthlySteps[month] || 0) + (parseInt(s.count) || 0);
        });

        const monthlyTrends = monthNames.map(month => ({
            month,
            steps: monthlySteps[month] || 0
        }));

        const bestMonth = Object.entries(monthlySteps).reduce((best, [name, steps]) => {
            return steps > best.steps ? { name, steps } : best;
        }, { name: '', steps: 0 });

        const wellnessData: {
            hr: Record<string, number[]>,
            hrv: Record<string, number[]>,
            stress: Record<string, number[]>,
            spo2: Record<string, number[]>
        } = { hr: {}, hrv: {}, stress: {}, spo2: {} };

        // Process Heart Rate
        data.heartRate.forEach(hr => {
            const dateObj = new Date(hr.start_time);
            if (dateObj.getFullYear() !== yearInt) return;
            const day = dateObj.toISOString().split('T')[0];
            if (!wellnessData.hr[day]) wellnessData.hr[day] = [];

            const binData = data.binningData[hr.binning_data] || data.binningData[hr['com.samsung.health.heart_rate.binning_data']];
            if (binData) {
                binData.forEach((b: any) => {
                    if (b.heart_rate) wellnessData.hr[day].push(b.heart_rate);
                });
            } else if (hr.heart_rate) {
                wellnessData.hr[day].push(parseInt(hr.heart_rate));
            }
        });

        // Process HRV
        data.hrv.forEach(h => {
            const dateObj = new Date(h.start_time);
            if (dateObj.getFullYear() !== yearInt) return;
            const day = dateObj.toISOString().split('T')[0];
            if (!wellnessData.hrv[day]) wellnessData.hrv[day] = [];

            const binData = data.binningData[h.binning_data];
            if (binData) {
                binData.forEach((b: any) => {
                    if (b.rmssd) wellnessData.hrv[day].push(b.rmssd);
                });
            }
        });

        // Process Stress
        data.stress.forEach(s => {
            const dateObj = new Date(s.start_time);
            if (dateObj.getFullYear() !== yearInt) return;
            const day = dateObj.toISOString().split('T')[0];
            if (!wellnessData.stress[day]) wellnessData.stress[day] = [];

            const binData = data.binningData[s.binning_data] || data.binningData[s['com.samsung.health.stress.binning_data']];
            if (binData) {
                binData.forEach((b: any) => {
                    if (b.score) wellnessData.stress[day].push(b.score);
                });
            } else if (s.score) {
                wellnessData.stress[day].push(parseInt(s.score));
            }
        });

        // Process SpO2
        data.oxygenSaturation.forEach(o => {
            const dateObj = new Date(o.start_time);
            if (dateObj.getFullYear() !== yearInt) return;
            const day = dateObj.toISOString().split('T')[0];
            if (!wellnessData.spo2[day]) wellnessData.spo2[day] = [];

            if (o.spo2) wellnessData.spo2[day].push(parseFloat(o.spo2));
        });

        const dailyHRData = Object.entries(wellnessData.hr).map(([date, vals]) => ({
            date,
            // Resting HR approx: 10th percentile of daily readings
            value: Math.round(vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.1)] || 0)
        })).filter(d => d.value > 0).sort((a, b) => a.date.localeCompare(b.date));

        const dailyHRVData = Object.entries(wellnessData.hrv).map(([date, vals]) => ({
            date,
            value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        })).filter(d => d.value > 0).sort((a, b) => a.date.localeCompare(b.date));

        const dailyStressData = Object.entries(wellnessData.stress).map(([date, vals]) => ({
            date,
            value: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        })).filter(d => d.value > 0).sort((a, b) => a.date.localeCompare(b.date));

        const dailySpO2Data = Object.entries(wellnessData.spo2).map(([date, vals]) => ({
            date,
            value: Math.round(Math.min(...vals))
        })).filter(d => d.value > 0).sort((a, b) => a.date.localeCompare(b.date));

        const avgRestingHR = dailyHRData.length > 0 ? Math.round(dailyHRData.reduce((s, d) => s + d.value, 0) / dailyHRData.length) : 0;
        const avgHRV = dailyHRVData.length > 0 ? Math.round(dailyHRVData.reduce((s, d) => s + d.value, 0) / dailyHRVData.length) : 0;
        const avgStress = dailyStressData.length > 0 ? Math.round(dailyStressData.reduce((s, d) => s + d.value, 0) / dailyStressData.length) : 0;
        const minSpO2 = dailySpO2Data.length > 0 ? Math.min(...dailySpO2Data.map(d => d.value)) : 0;

        const hrTrends = data.heartRate
            .filter(hr => new Date(hr.start_time).getFullYear() === yearInt)
            .slice(-30)
            .map(hr => ({
                time: hr.start_time?.split(' ')[1] || '',
                heartRate: parseInt(hr.heart_rate) || 0
            }));

        const stressTrends = data.stress
            .filter(s => new Date(s.start_time).getFullYear() === yearInt)
            .slice(-20)
            .map(s => ({
                time: s.start_time?.split(' ')[1] || '',
                score: parseInt(s.stress || s.score) || 0
            }));

        const exerciseCounts: Record<string, number> = {};
        const yearWorkouts: WorkoutRecord[] = [];
        data.exercises
            .filter(e => {
                const startTime = e['com.samsung.health.exercise.start_time'] || e.start_time;
                return startTime && new Date(startTime).getFullYear() === yearInt;
            })
            .forEach(e => {
                const typeId = parseInt(e['com.samsung.health.exercise.exercise_type'] || e.exercise_type) || 0;
                const name = EXERCISE_TYPES[typeId] || 'Workout';
                exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;

                const durationMs = parseFloat(e['com.samsung.health.exercise.duration'] || e.duration) || 0;
                const startTimeStr = e['com.samsung.health.exercise.start_time'] || e.start_time;
                const calories = parseFloat(e['com.samsung.health.exercise.calorie'] || e.calorie) || 0;
                const distance = parseFloat(e['com.samsung.health.exercise.distance'] || e.distance) || 0;
                const avgHR = parseFloat(e['com.samsung.health.exercise.mean_heart_rate'] || e.mean_heart_rate) || 0;
                const maxHR = parseFloat(e['com.samsung.health.exercise.max_heart_rate'] || e.max_heart_rate) || 0;
                const avgSpeed = parseFloat(e['com.samsung.health.exercise.mean_speed'] || e.mean_speed) || 0;

                yearWorkouts.push({
                    type: name,
                    duration: durationMs / 60000,
                    calories,
                    distance: distance > 0 ? distance / 1000 : undefined,
                    avgHR: avgHR > 0 ? avgHR : undefined,
                    maxHR: maxHR > 0 ? maxHR : undefined,
                    avgSpeed: avgSpeed > 0 ? avgSpeed : undefined,
                    startTime: startTimeStr,
                    date: startTimeStr ? startTimeStr.split(' ')[0] : ''
                });
            });

        yearWorkouts.sort((a, b) => b.startTime.localeCompare(a.startTime));


        const topExercises = Object.entries(exerciseCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        const dailyWorkouts: Record<string, { duration: number, calories: number, distance: number }> = {};
        yearWorkouts.forEach(w => {
            if (w.date) {
                if (!dailyWorkouts[w.date]) dailyWorkouts[w.date] = { duration: 0, calories: 0, distance: 0 };
                dailyWorkouts[w.date].duration += w.duration;
                dailyWorkouts[w.date].calories += w.calories;
                dailyWorkouts[w.date].distance += w.distance || 0;
            }
        });

        const dailyWorkoutData = Object.entries(dailyWorkouts).map(([date, d]) => ({
            date,
            ...d
        })).sort((a, b) => a.date.localeCompare(b.date));

        const sleepRecords = processedSleep.filter(s => {
            const startTime = s['com.samsung.health.sleep.start_time'] || s.start_time || s.update_time;
            const date = new Date(startTime);
            return date.getFullYear() === yearInt;
        });


        const dailySleep: Record<string, { duration: number, efficiency: number[], score: number[], bedTimes: number[], wakeTimes: number[], count: number }> = {};

        sleepRecords.forEach(s => {
            const startDate = new Date(s._start);
            const endDate = new Date(s._end);
            const day = startDate.toISOString().split('T')[0];
            const duration = s._duration;
            const efficiency = s._efficiency;
            const score = s._score;

            const bedTimeMinutes = startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
            const wakeTimeMinutes = endDate.getUTCHours() * 60 + endDate.getUTCMinutes();

            if (duration > 0) {
                if (!dailySleep[day]) dailySleep[day] = { duration: 0, efficiency: [], score: [], bedTimes: [], wakeTimes: [], count: 0 };
                dailySleep[day].duration += duration;

                if (efficiency > 0) dailySleep[day].efficiency.push(efficiency);
                if (score > 0) dailySleep[day].score.push(score);

                dailySleep[day].bedTimes.push(bedTimeMinutes);
                dailySleep[day].wakeTimes.push(wakeTimeMinutes);
                dailySleep[day].count++;
            }
        });

        const sleepDays = Object.values(dailySleep);
        const totalSleepMinutes = sleepDays.reduce((sum, d) => sum + d.duration, 0);
        const avgSleepMinutes = sleepDays.length > 0 ? totalSleepMinutes / sleepDays.length : 0;

        const avgEfficiency = sleepDays.length > 0
            ? sleepDays.reduce((sum, d) => {
                const dayEff = d.efficiency.length > 0
                    ? d.efficiency.reduce((a, b) => a + b, 0) / d.efficiency.length
                    : 0;
                return sum + dayEff;
            }, 0) / sleepDays.length
            : 0;

        const avgSleepScore = sleepDays.length > 0
            ? sleepDays.reduce((sum, d) => {
                const dayScore = d.score.length > 0
                    ? d.score.reduce((a, b) => a + b, 0) / d.score.length
                    : 0;
                return sum + dayScore;
            }, 0) / sleepDays.length
            : 0;

        const isLeap = (yearInt % 4 === 0 && yearInt % 100 !== 0) || (yearInt % 400 === 0);
        const daysInYear = yearInt === new Date().getFullYear() ?
            Math.floor((new Date().getTime() - new Date(yearInt, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) :
            (isLeap ? 366 : 365);

        // Calculate Personal Records
        const mostStepsDay = yearSteps.reduce((best, s) => {
            const count = parseInt(s.count) || 0;
            return count > best.count ? { count, date: s.day_time ? new Date(parseInt(s.day_time)).toISOString().split('T')[0] : new Date(s.update_time).toISOString().split('T')[0] } : best;
        }, { count: 0, date: '' });

        const longestWorkout = yearWorkouts.reduce((best, w) => {
            return w.duration > best.duration ? { duration: w.duration, type: w.type, date: w.date } : best;
        }, { duration: 0, type: '', date: '' });

        const bestSleepScore = Object.entries(dailySleep).reduce((best, [date, d]) => {
            const score = d.score.length > 0 ? d.score.reduce((a, b) => a + b, 0) / d.score.length : 0;
            return score > best.score ? { score, date } : best;
        }, { score: 0, date: '' });

        // Calculate weekday statistics
        const weekdayData: Record<string, { steps: number[], workouts: number, sleep: number[], stress: number[] }> = {
            'Sunday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Monday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Tuesday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Wednesday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Thursday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Friday': { steps: [], workouts: 0, sleep: [], stress: [] },
            'Saturday': { steps: [], workouts: 0, sleep: [], stress: [] }
        };

        yearSteps.forEach(s => {
            const date = new Date(s.day_time ? parseInt(s.day_time) : s.update_time);
            const dayName = getDayName(date);
            weekdayData[dayName].steps.push(parseInt(s.count) || 0);
        });

        yearWorkouts.forEach(w => {
            const date = new Date(w.startTime);
            const dayName = getDayName(date);
            weekdayData[dayName].workouts++;
        });

        Object.entries(dailySleep).forEach(([dateStr, d]) => {
            const date = new Date(dateStr);
            const dayName = getDayName(date);
            weekdayData[dayName].sleep.push(d.duration / 60);
        });

        const weekdayStats = Object.entries(weekdayData).map(([day, data]) => ({
            day,
            avgSteps: data.steps.length > 0 ? Math.round(data.steps.reduce((a, b) => a + b, 0) / data.steps.length) : 0,
            avgWorkouts: data.workouts,
            avgSleep: data.sleep.length > 0 ? data.sleep.reduce((a, b) => a + b, 0) / data.sleep.length : 0,
            avgStress: 0
        }));

        // Calculate correlations
        const dailyData: { date: string, steps: number, sleep: number, stress: number }[] = [];
        Object.entries(dailySleep).forEach(([date, d]) => {
            const stepData = yearSteps.find(s => {
                const sDate = s.day_time ? new Date(parseInt(s.day_time)).toISOString().split('T')[0] : new Date(s.update_time).toISOString().split('T')[0];
                return sDate === date;
            });
            dailyData.push({
                date,
                steps: stepData ? parseInt(stepData.count) || 0 : 0,
                sleep: d.duration / 60,
                stress: 0
            });
        });

        const sleepValues = dailyData.map(d => d.sleep);
        const stepsValues = dailyData.map(d => d.steps);
        const sleepVsActivity = calculateCorrelation(sleepValues, stepsValues);

        const correlations = {
            sleepVsActivity,
            stressVsWorkouts: 0,
            hrVsSleep: 0
        };

        // Calculate Wrapped Insights
        // Personality Analysis
        const workoutHours = yearWorkouts.map(w => new Date(w.startTime).getHours());
        const avgWorkoutHour = workoutHours.length > 0 ? workoutHours.reduce((a, b) => a + b, 0) / workoutHours.length : 12;
        const fitnessType: 'Early Bird' | 'Night Owl' | 'Balanced' =
            avgWorkoutHour < 10 ? 'Early Bird' : avgWorkoutHour > 17 ? 'Night Owl' : 'Balanced';

        const weekendWorkouts = yearWorkouts.filter(w => {
            const day = new Date(w.startTime).getDay();
            return day === 0 || day === 6;
        }).length;
        const weekdayWorkouts = yearWorkouts.length - weekendWorkouts;
        const workoutStyle: 'Weekend Warrior' | 'Consistent Grinder' | 'Casual' =
            weekendWorkouts > weekdayWorkouts * 1.5 ? 'Weekend Warrior' :
                yearWorkouts.length > 150 ? 'Consistent Grinder' : 'Casual';

        const bedtimeHours = Object.values(dailySleep).flatMap(d => d.bedTimes).map(m => Math.floor(m / 60));
        const avgBedtimeHour = bedtimeHours.length > 0 ? bedtimeHours.reduce((a, b) => a + b, 0) / bedtimeHours.length : 23;
        const sleepArchetype: 'Consistent Sleeper' | 'Night Owl' | 'Early Riser' | 'Variable' =
            avgEfficiency > 85 ? 'Consistent Sleeper' :
                avgBedtimeHour > 23 ? 'Night Owl' :
                    avgBedtimeHour < 22 ? 'Early Riser' : 'Variable';

        // Niche Stats
        const marathonsWalked = Math.floor(totalDistance / 42195); // 42.195 km per marathon
        const caloriesInPizzas = Math.floor(totalCalories / 285); // ~285 cal per pizza slice
        const sleepDaysTotal = Math.floor(avgSleepMinutes * sleepDays.length / 1440);

        const hourlyWorkouts: Record<number, number> = {};
        yearWorkouts.forEach(w => {
            const hour = new Date(w.startTime).getHours();
            hourlyWorkouts[hour] = (hourlyWorkouts[hour] || 0) + 1;
        });
        const mostActiveHour = Object.entries(hourlyWorkouts).reduce((max, [hour, count]) =>
            count > (hourlyWorkouts[max] || 0) ? parseInt(hour) : max, 0);

        const dayWorkoutCounts = weekdayStats.map(d => ({ day: d.day, count: d.avgWorkouts }));
        const favoriteWorkoutDay = dayWorkoutCounts.reduce((max, d) =>
            d.count > max.count ? d : max, { day: 'Monday', count: 0 }).day;

        // Calculate longest streak
        const sortedStepDates = yearSteps
            .map(s => s.day_time ? new Date(parseInt(s.day_time)) : new Date(s.update_time))
            .sort((a, b) => a.getTime() - b.getTime());

        let longestStreak = 0;
        let currentStreak = 0;
        for (let i = 1; i < sortedStepDates.length; i++) {
            const dayDiff = (sortedStepDates[i].getTime() - sortedStepDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff <= 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        // Fun Comparisons
        const distanceEquivalent = marathonsWalked > 0 ?
            `${marathonsWalked} marathon${marathonsWalked > 1 ? 's' : ''}` :
            `${Math.floor(totalDistance / 5)} 5K runs`;

        const calorieEquivalent = `${caloriesInPizzas} pizza slices`;
        const sleepEquivalent = `${sleepDaysTotal} full days`;

        // Patterns
        const wrappedMonthlySteps = monthlyTrends.reduce((max, m) => m.steps > max.steps ? m : max, { month: 'Jan', steps: 0 });
        const mostProductiveMonth = wrappedMonthlySteps.month;

        const bestWorkoutTime = mostActiveHour < 12 ? 'Morning' : mostActiveHour < 17 ? 'Afternoon' : 'Evening';

        const firstHalfSleep = sleepDays.slice(0, Math.floor(sleepDays.length / 2));
        const secondHalfSleep = sleepDays.slice(Math.floor(sleepDays.length / 2));
        const firstHalfAvg = firstHalfSleep.length > 0 ? firstHalfSleep.reduce((sum, d) => sum + d.duration, 0) / firstHalfSleep.length : 0;
        const secondHalfAvg = secondHalfSleep.length > 0 ? secondHalfSleep.reduce((sum, d) => sum + d.duration, 0) / secondHalfSleep.length : 0;
        const sleepQualityTrend: 'improving' | 'stable' | 'declining' =
            secondHalfAvg > firstHalfAvg * 1.05 ? 'improving' :
                secondHalfAvg < firstHalfAvg * 0.95 ? 'declining' : 'stable';

        const wrappedInsights = {
            personality: {
                fitnessType,
                workoutStyle,
                sleepArchetype
            },
            nicheStats: {
                marathonsWalked,
                caloriesInPizzas,
                sleepDaysTotal,
                mostActiveHour,
                favoriteWorkoutDay,
                longestStreak
            },
            funComparisons: {
                distanceEquivalent,
                calorieEquivalent,
                sleepEquivalent
            },
            patterns: {
                mostProductiveMonth,
                bestWorkoutTime,
                sleepQualityTrend
            }
        };

        result[year] = {
            year,
            totalSteps,
            dailyAvg: Math.round(totalSteps / Math.max(daysInYear, 1)),
            totalCalories: Math.round(totalCalories),
            totalDistance: Math.round((totalDistance / 1000) * 100) / 100,
            avgSpeed: Math.round(avgSpeed * 10) / 10,
            bestDay,
            bestMonth,
            monthlyTrends,
            topExercises,
            avgSleepDuration: avgSleepMinutes / 60,
            avgEfficiency: Math.round(avgEfficiency),
            avgSleepScore: Math.round(avgSleepScore),
            avgBedTime: formatToHHmm(calculateCircularAverage(sleepDays.flatMap(d => d.bedTimes))),
            avgWakeTime: formatToHHmm(calculateCircularAverage(sleepDays.flatMap(d => d.wakeTimes))),
            totalWorkouts: data.exercises.filter(e => {
                const startTime = e['com.samsung.health.exercise.start_time'] || e.start_time;
                return startTime && new Date(startTime).getFullYear() === yearInt;
            }).length,
            heartRate: hrTrends,
            stress: stressTrends,
            avgRestingHR,
            avgHRV,
            avgStress,
            minSpO2,
            dailyHRData,
            dailyHRVData,
            dailyStressData,
            dailySpO2Data,
            dailyStepData: yearSteps.map(s => ({
                date: s.day_time ? new Date(parseInt(s.day_time)).toISOString().split('T')[0] : new Date(s.update_time).toISOString().split('T')[0],
                count: parseInt(s.count) || 0
            })).sort((a, b) => a.date.localeCompare(b.date)),
            dailySleepData: Object.entries(dailySleep).map(([date, d]) => ({
                date,
                duration: d.duration / 60
            })).sort((a, b) => a.date.localeCompare(b.date)),
            dailySleepScoreData: Object.entries(dailySleep).map(([date, d]) => ({
                date,
                score: d.score.length > 0 ? d.score.reduce((a, b) => a + b, 0) / d.score.length : 0
            })).sort((a, b) => a.date.localeCompare(b.date)),
            workouts: yearWorkouts,
            totalWorkoutDuration: yearWorkouts.reduce((sum, w) => sum + w.duration, 0),
            totalWorkoutCalories: yearWorkouts.reduce((sum, w) => sum + w.calories, 0),
            totalWorkoutDistance: yearWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
            dailyWorkoutData,

            // New analytics fields
            personalRecords: {
                mostStepsDay,
                longestWorkout,
                bestSleepScore,
                mostActiveWeek: { steps: 0, weekStart: '' },
                longestStreak: { days: 0, endDate: '' }
            },
            weekdayStats,
            monthlyComparison: [],
            seasonalData: [],
            correlations,
            wrappedInsights
        };
    });

    // Aggregate "All Time" stats
    const allYears = Object.values(result) as YearStats[];
    if (allYears.length > 0) {
        const totalSteps = allYears.reduce((sum, y) => sum + y.totalSteps, 0);
        const totalCalories = allYears.reduce((sum, y) => sum + y.totalCalories, 0);
        const totalDistance = allYears.reduce((sum, y) => sum + y.totalDistance, 0);
        const totalWorkouts = allYears.reduce((sum, y) => sum + y.totalWorkouts, 0);
        const totalWorkoutDuration = allYears.reduce((sum, y) => sum + y.totalWorkoutDuration, 0);
        const totalWorkoutCalories = allYears.reduce((sum, y) => sum + y.totalWorkoutCalories, 0);
        const totalWorkoutDistance = allYears.reduce((sum, y) => sum + y.totalWorkoutDistance, 0);
        const allWorkouts = allYears.flatMap(y => y.workouts).sort((a, b) => b.startTime.localeCompare(a.startTime));
        const dailyWorkoutData = allYears.flatMap(y => y.dailyWorkoutData).sort((a, b) => a.date.localeCompare(b.date));

        result['All Time'] = {
            year: 'All Time',
            totalSteps,
            dailyAvg: Math.round(allYears.reduce((sum, y) => sum + y.dailyAvg, 0) / allYears.length),
            totalCalories,
            totalDistance,
            avgSpeed: Math.round((allYears.reduce((sum, y) => sum + y.avgSpeed, 0) / allYears.length) * 10) / 10,
            bestDay: allYears.reduce((best, y) => y.bestDay.count > (best as any).count ? y.bestDay : best, { count: 0, date: '' }),
            bestMonth: allYears.reduce((best, y) => y.bestMonth.steps > (best as any).steps ? y.bestMonth : best, { name: '', steps: 0 }),
            monthlyTrends: monthNames.map(month => ({
                month,
                steps: allYears.reduce((sum, y) => sum + (y.monthlyTrends.find(m => m.month === month)?.steps || 0), 0)
            })),
            topExercises: Object.entries(allYears.reduce((acc, y) => {
                y.topExercises.forEach(e => {
                    acc[e.name] = (acc[e.name] || 0) + e.count;
                });
                return acc;
            }, {} as Record<string, number>))
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({ name, count })),
            avgSleepDuration: allYears.reduce((sum, y) => sum + y.avgSleepDuration, 0) / allYears.length,
            avgEfficiency: Math.round(allYears.reduce((sum, y) => sum + y.avgEfficiency, 0) / allYears.length),
            avgSleepScore: Math.round(allYears.reduce((sum, y) => sum + y.avgSleepScore, 0) / allYears.length),
            avgBedTime: formatToHHmm(calculateCircularAverage(allYears.map(y => {
                const [h, m] = y.avgBedTime.split(':').map(Number);
                return h * 60 + m;
            }).filter(m => !isNaN(m)))),
            avgWakeTime: formatToHHmm(calculateCircularAverage(allYears.map(y => {
                const [h, m] = y.avgWakeTime.split(':').map(Number);
                return h * 60 + m;
            }).filter(m => !isNaN(m)))),
            totalWorkouts,
            heartRate: [],
            stress: [],
            avgRestingHR: Math.round(allYears.reduce((sum, y) => sum + y.avgRestingHR, 0) / allYears.length),
            avgHRV: Math.round(allYears.reduce((sum, y) => sum + y.avgHRV, 0) / allYears.length),
            avgStress: Math.round(allYears.reduce((sum, y) => sum + y.avgStress, 0) / allYears.length),
            minSpO2: Math.min(...allYears.map(y => y.minSpO2).filter(v => v > 0)),
            dailyHRData: allYears.flatMap(y => y.dailyHRData).sort((a, b) => a.date.localeCompare(b.date)),
            dailyHRVData: allYears.flatMap(y => y.dailyHRVData).sort((a, b) => a.date.localeCompare(b.date)),
            dailyStressData: allYears.flatMap(y => y.dailyStressData).sort((a, b) => a.date.localeCompare(b.date)),
            dailySpO2Data: allYears.flatMap(y => y.dailySpO2Data).sort((a, b) => a.date.localeCompare(b.date)),
            dailyStepData: allYears.flatMap(y => y.dailyStepData).sort((a, b) => a.date.localeCompare(b.date)),
            dailySleepData: allYears.flatMap(y => y.dailySleepData).sort((a, b) => a.date.localeCompare(b.date)),
            workouts: allWorkouts,
            totalWorkoutDuration,
            totalWorkoutCalories,
            totalWorkoutDistance,
            dailyWorkoutData,
            dailySleepScoreData: allYears.flatMap(y => y.dailySleepScoreData).sort((a, b) => a.date.localeCompare(b.date)),

            // Aggregate analytics fields
            personalRecords: {
                mostStepsDay: allYears.reduce((best, y) => y.personalRecords.mostStepsDay.count > best.count ? y.personalRecords.mostStepsDay : best, { count: 0, date: '' }),
                longestWorkout: allYears.reduce((best, y) => y.personalRecords.longestWorkout.duration > best.duration ? y.personalRecords.longestWorkout : best, { duration: 0, type: '', date: '' }),
                bestSleepScore: allYears.reduce((best, y) => y.personalRecords.bestSleepScore.score > best.score ? y.personalRecords.bestSleepScore : best, { score: 0, date: '' }),
                mostActiveWeek: { steps: 0, weekStart: '' },
                longestStreak: { days: 0, endDate: '' }
            },
            weekdayStats: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => ({
                day,
                avgSteps: Math.round(allYears.reduce((sum, y) => sum + (y.weekdayStats.find(w => w.day === day)?.avgSteps || 0), 0) / allYears.length),
                avgWorkouts: Math.round(allYears.reduce((sum, y) => sum + (y.weekdayStats.find(w => w.day === day)?.avgWorkouts || 0), 0) / allYears.length),
                avgSleep: allYears.reduce((sum, y) => sum + (y.weekdayStats.find(w => w.day === day)?.avgSleep || 0), 0) / allYears.length,
                avgStress: 0
            })),
            monthlyComparison: [],
            seasonalData: [],
            correlations: {
                sleepVsActivity: allYears.reduce((sum, y) => sum + y.correlations.sleepVsActivity, 0) / allYears.length,
                stressVsWorkouts: 0,
                hrVsSleep: 0
            },
            wrappedInsights: {
                personality: {
                    fitnessType: allYears[allYears.length - 1]?.wrappedInsights.personality.fitnessType || 'Balanced',
                    workoutStyle: allYears[allYears.length - 1]?.wrappedInsights.personality.workoutStyle || 'Casual',
                    sleepArchetype: allYears[allYears.length - 1]?.wrappedInsights.personality.sleepArchetype || 'Variable'
                },
                nicheStats: {
                    marathonsWalked: allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.marathonsWalked, 0),
                    caloriesInPizzas: allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.caloriesInPizzas, 0),
                    sleepDaysTotal: allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.sleepDaysTotal, 0),
                    mostActiveHour: allYears[allYears.length - 1]?.wrappedInsights.nicheStats.mostActiveHour || 12,
                    favoriteWorkoutDay: allYears[allYears.length - 1]?.wrappedInsights.nicheStats.favoriteWorkoutDay || 'Monday',
                    longestStreak: allYears.reduce((best, y) => y.wrappedInsights.nicheStats.longestStreak > best ? y.wrappedInsights.nicheStats.longestStreak : best, 0)
                },
                funComparisons: {
                    distanceEquivalent: `${allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.marathonsWalked, 0)} marathons`,
                    calorieEquivalent: `${allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.caloriesInPizzas, 0)} pizza slices`,
                    sleepEquivalent: `${allYears.reduce((sum, y) => sum + y.wrappedInsights.nicheStats.sleepDaysTotal, 0)} full days`
                },
                patterns: {
                    mostProductiveMonth: allYears[allYears.length - 1]?.wrappedInsights.patterns.mostProductiveMonth || 'Jan',
                    bestWorkoutTime: allYears[allYears.length - 1]?.wrappedInsights.patterns.bestWorkoutTime || 'Morning',
                    sleepQualityTrend: allYears[allYears.length - 1]?.wrappedInsights.patterns.sleepQualityTrend || 'stable'
                }
            }
        };
    }

    return result;
};
