/**
 * GIA Aircraft Log System
 * reports.js — PAX summary and Freight reports
 */

// ── PAX REPORT ──
function renderPaxReport() {
  const el = document.getElementById('pax-report-body');

  if (!logs.length) {
    el.innerHTML = '<div style="color:var(--muted)">No data. Add log entries first.</div>';
    return;
  }

  // Aggregate by destination
  const destMap = {};
  logs.forEach(l => {
    if (!destMap[l.dest]) destMap[l.dest] = { arr: 0, dep: 0, trn: 0, flights: 0 };
    destMap[l.dest].arr     += l.totArr;
    destMap[l.dest].dep     += l.totDep;
    destMap[l.dest].trn     += l.totTrn;
    destMap[l.dest].flights += 1;
  });

  const totals = Object.values(destMap).reduce(
    (acc, v) => ({ arr: acc.arr + v.arr, dep: acc.dep + v.dep, trn: acc.trn + v.trn, flights: acc.flights + v.flights }),
    { arr: 0, dep: 0, trn: 0, flights: 0 }
  );

  el.innerHTML = `
    <table class="log-table">
      <thead>
        <tr>
          <th>Destination</th>
          <th>Flights</th>
          <th>Total ARR</th>
          <th>Total DEP</th>
          <th>Total TRN</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(destMap)
          .sort((a, b) => b[1].arr - a[1].arr)
          .map(([dest, v]) => `
            <tr>
              <td class="col-flt">${dest || '—'}</td>
              <td>${v.flights}</td>
              <td>${v.arr}</td>
              <td>${v.dep}</td>
              <td>${v.trn}</td>
            </tr>`)
          .join('')}
        <tr class="total-row">
          <td style="color:var(--accent)">TOTALS</td>
          <td>${totals.flights}</td>
          <td>${totals.arr}</td>
          <td>${totals.dep}</td>
          <td>${totals.trn}</td>
        </tr>
      </tbody>
    </table>`;
}

// ── FREIGHT REPORT ──
function renderFrtReport() {
  const el = document.getElementById('frt-report-body');

  if (!logs.length) {
    el.innerHTML = '<div style="color:var(--muted)">No data. Add log entries first.</div>';
    return;
  }

  const totalFrtIn  = logs.reduce((a, l) => a + (l.frtin  || 0), 0);
  const totalFrtOut = logs.reduce((a, l) => a + (l.frtout || 0), 0);
  const totalTrnFrt = logs.reduce((a, l) => a + (l.trnfrt || 0), 0);

  el.innerHTML = `
    <table class="log-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Flight</th>
          <th>A/C</th>
          <th>Dest</th>
          <th>FRT IN (kg)</th>
          <th>FRT OUT (kg)</th>
          <th>TRN FRT (kg)</th>
          <th>Logged By</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(l => `
          <tr>
            <td class="col-date">${l.date || '—'}</td>
            <td class="col-flt">${l.flt}</td>
            <td class="col-ac">${l.actype}</td>
            <td>${l.dest || '—'}</td>
            <td>${l.frtin  || 0}</td>
            <td>${l.frtout || 0}</td>
            <td>${l.trnfrt || 0}</td>
            <td style="color:var(--muted);font-size:10px">${l.loggedByName || '—'}</td>
          </tr>`).join('')}
        <tr class="total-row">
          <td colspan="4" style="color:var(--accent)">TOTALS</td>
          <td>${totalFrtIn} kg</td>
          <td>${totalFrtOut} kg</td>
          <td>${totalTrnFrt} kg</td>
          <td></td>
        </tr>
      </tbody>
    </table>`;
}
