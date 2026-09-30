'use client';

import React from 'react';
import Link from 'next/link';
import { DailyRollGroupRow } from '../types/attendance';
import {
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface DailyAttendanceOverviewTableProps {
  rows: DailyRollGroupRow[];
  selectedDate: string;
  staffName: string;
}

export const DailyAttendanceOverviewTable: React.FC<DailyAttendanceOverviewTableProps> = ({
  rows,
  selectedDate,
  staffName,
}) => {
  const totalClasses = rows.length;
  const takenCount = rows.filter((r) => r.todayStatus === 'TAKEN').length;
  const notTakenCount = rows.filter((r) => r.todayStatus === 'NOT_TAKEN').length;
  const notTimetabledCount = rows.filter((r) => r.todayStatus === 'NOT_TIMETABLED').length;

  return (
    <div className="daily-overview-container">
      {/* Overview Statistics Bar */}
      <div className="daily-stats-bar">
        <div className="stat-pill stat-total">
          <Calendar size={15} />
          <span>Classes Assigned: <strong>{totalClasses}</strong></span>
        </div>
        <div className="stat-pill stat-present">
          <CheckCircle size={15} />
          <span>Attendance Taken: <strong>{takenCount}</strong></span>
        </div>
        {notTakenCount > 0 && (
          <div className="stat-pill stat-absent">
            <AlertTriangle size={15} />
            <span>Attendance Pending: <strong>{notTakenCount}</strong></span>
          </div>
        )}
        {notTimetabledCount > 0 && (
          <div className="stat-pill stat-total">
            <MinusCircle size={15} />
            <span>Not Timetabled: <strong>{notTimetabledCount}</strong></span>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="table-responsive-wrapper">
        <table className="daily-overview-table" aria-label="Daily attendance overview by class and section">
          <thead>
            <tr>
              <th style={{ minWidth: '180px' }}>Class & Section</th>
              <th style={{ minWidth: '150px' }}>Session</th>
              <th style={{ minWidth: '140px' }}>Today ({selectedDate})</th>
              <th style={{ minWidth: '180px' }}>Today Summary</th>
              <th style={{ minWidth: '280px', textAlign: 'center' }}>10-School-Day History</th>
              <th style={{ width: '150px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isTaken = row.todayStatus === 'TAKEN';
              const isNotTaken = row.todayStatus === 'NOT_TAKEN';

              return (
                <tr key={row.id} className="daily-overview-row">
                  {/* Class & Section */}
                  <td className="cell-class-info">
                    <span className="class-title">{row.className} - {row.sectionName}</span>
                    <span className="program-subtitle text-muted">{row.programName}</span>
                  </td>

                  {/* Session */}
                  <td className="cell-session-name">
                    <span className="session-badge">{row.sessionName}</span>
                  </td>

                  {/* Today Status */}
                  <td className="cell-today-status">
                    {isTaken && (
                      <span className="status-badge-chip chip-taken">
                        <CheckCircle size={13} /> Taken
                      </span>
                    )}
                    {isNotTaken && (
                      <span className="status-badge-chip chip-not-taken">
                        <AlertTriangle size={13} /> Not Taken
                      </span>
                    )}
                    {row.todayStatus === 'NOT_TIMETABLED' && (
                      <span className="status-badge-chip chip-not-timetabled">
                        <MinusCircle size={13} /> Not Timetabled
                      </span>
                    )}
                  </td>

                  {/* Summary / Recorded Info */}
                  <td className="cell-summary-info">
                    {isTaken ? (
                      <div className="taken-details">
                        <span className="taken-counts">
                          Present: <strong>{row.presentCount}</strong> / {row.totalStudents} ({Math.round((row.presentCount / row.totalStudents) * 100)}%)
                        </span>
                        <span className="recorded-by-text text-muted">
                          by {row.recordedBy} at {row.recordedAt}
                        </span>
                      </div>
                    ) : (
                      <span className="pending-text text-muted">
                        Pending submission for {row.totalStudents} students
                      </span>
                    )}
                  </td>

                  {/* 10-School-Day History Strip */}
                  <td className="cell-ten-day-history">
                    <div className="ten-day-grid">
                      {row.tenDayHistory.map((hist, idx) => (
                        <Link
                          key={idx}
                          href={`/attendance/mark/section?date=${encodeURIComponent(hist.date)}`}
                          className={`history-day-cell cell-hist-${hist.status.toLowerCase()}`}
                          title={`${hist.dayName} ${hist.date}: ${hist.status === 'TAKEN' ? 'Attendance Taken' : 'Not Taken'}`}
                        >
                          <span className="day-name">{hist.dayName}</span>
                          <span className="day-date">{hist.date.split('/')[0]}</span>
                          <span className="day-indicator" />
                        </Link>
                      ))}
                    </div>
                  </td>

                  {/* Action Link */}
                  <td className="cell-action-col" style={{ textAlign: 'right' }}>
                    {isNotTaken ? (
                      <Link
                        href={`/attendance/mark/section`}
                        className="btn-take-attendance"
                        title="Open section marking grid"
                      >
                        <span>Take Attendance</span>
                        <ArrowRight size={13} />
                      </Link>
                    ) : (
                      <Link
                        href={`/attendance/mark/section`}
                        className="btn-view-attendance"
                        title="View or modify section attendance"
                      >
                        Edit / View
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="daily-overview-footer">
        <span className="footer-staff-assigned text-muted">
          Showing classes assigned to <strong>{staffName}</strong> on <strong>{selectedDate}</strong>
        </span>
        <div className="history-legend">
          <span className="legend-item"><span className="legend-circle circle-taken" /> Taken</span>
          <span className="legend-item"><span className="legend-circle circle-not-taken" /> Not Taken</span>
          <span className="legend-item"><span className="legend-circle circle-holiday" /> Holiday / Off</span>
        </div>
      </div>
    </div>
  );
};
