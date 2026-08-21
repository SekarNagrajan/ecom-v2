/* @ds-bundle: {"format":3,"namespace":"ClaudeNovaDesignSystem_82cf0d","components":[],"sourceHashes":{"ui_kits/nova/AppShell.jsx":"e52bd0b006c2","ui_kits/nova/Dashboard.jsx":"b994cb1978fb","ui_kits/nova/Login.jsx":"22343104e433","ui_kits/nova/ReceiptList.jsx":"9d3014583384","ui_kits/nova/ReceiptWizard.jsx":"4ff48d6780c1","ui_kits/nova/components.jsx":"d1c31f9828cc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ClaudeNovaDesignSystem_82cf0d = window.ClaudeNovaDesignSystem_82cf0d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/nova/AppShell.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   App Shell — header, sidebar, tab bar, main container
   ============================================================ */

const {
  useState,
  useEffect,
  useMemo,
  Fragment: AppFragment
} = React;

/* ---------- Header ---------- */
function AppHeader({
  user,
  onToggleSidebar,
  onLogout
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "app-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onToggleSidebar,
    title: "Menu"
  }, /*#__PURE__*/React.createElement(IconMenu, {
    size: 20,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/svmlogowhite.png",
    alt: "SOLVERMINDS",
    className: "app-header-logo",
    style: {
      height: 30,
      width: 'auto',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Global search"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 6,
      background: 'rgba(255,255,255,0.08)',
      fontSize: 12,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(IconBuilding, {
    size: 14,
    color: "#fff"
  }), " SVMOB \xB7 Singapore"), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Language"
  }, /*#__PURE__*/React.createElement(IconWorld, {
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Mega menu"
  }, /*#__PURE__*/React.createElement(IconGrid, {
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Full screen"
  }, /*#__PURE__*/React.createElement(IconMaximize, {
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Notifications",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(IconBell, {
    size: 18,
    color: "#fff"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 9999,
      background: '#ef4444',
      border: '1.5px solid rgb(13,33,136)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Settings"
  }, /*#__PURE__*/React.createElement(IconSettings, {
    size: 18,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '2px 10px 2px 4px',
      borderRadius: 9999,
      background: 'rgba(255,255,255,0.1)',
      marginLeft: 6,
      cursor: 'pointer'
    },
    onClick: onLogout,
    title: "Sign out"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 9999,
      background: '#0a91ff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700
    }
  }, (user?.name || 'DL').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, user?.name || 'D. Loganathan'))));
}

/* ---------- Tab bar of open modules ---------- */
function TabBar({
  tabs,
  activeKey,
  onSelect,
  onClose,
  onHome
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tabbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: `tab ${activeKey === 'home' ? 'active' : ''}`,
    onClick: onHome
  }, activeKey === 'home' ? /*#__PURE__*/React.createElement(IconHomeFill, {
    size: 16
  }) : /*#__PURE__*/React.createElement(IconHome, {
    size: 16
  })), tabs.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.key,
    className: `tab ${activeKey === t.key ? 'active' : ''}`,
    onClick: () => onSelect(t.key)
  }, /*#__PURE__*/React.createElement("span", null, t.title), /*#__PURE__*/React.createElement("span", {
    className: "close-x",
    onClick: e => {
      e.stopPropagation();
      onClose(t.key);
    },
    title: "Close"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 11
  })))));
}

/* ---------- Sidebar ---------- */
function Sidebar({
  collapsed,
  activeModule,
  onOpenModule,
  onHome
}) {
  const groups = [{
    label: 'Operations',
    items: [{
      key: 'home',
      label: 'Dashboard',
      icon: /*#__PURE__*/React.createElement(IconHome, {
        size: 16
      }),
      onClick: onHome
    }]
  }, {
    label: 'Imports (IMP)',
    items: [{
      key: 'RCE',
      label: 'Receipt',
      icon: /*#__PURE__*/React.createElement(IconReceipt, {
        size: 16
      }),
      badge: 'RCE'
    }, {
      key: 'ARN',
      label: 'Arrival Notice',
      icon: /*#__PURE__*/React.createElement(IconFile, {
        size: 16
      }),
      badge: 'ARN'
    }, {
      key: 'DOP',
      label: 'Delivery Order',
      icon: /*#__PURE__*/React.createElement(IconTruck, {
        size: 16
      }),
      badge: 'DOP'
    }, {
      key: 'EIN',
      label: 'Export Invoice',
      icon: /*#__PURE__*/React.createElement(IconCash, {
        size: 16
      }),
      badge: 'EIN'
    }, {
      key: 'DEM',
      label: 'Demurrage Tariff',
      icon: /*#__PURE__*/React.createElement(IconReport, {
        size: 16
      }),
      badge: 'DEM'
    }, {
      key: 'WDV',
      label: 'Detention Waiver',
      icon: /*#__PURE__*/React.createElement(IconFiles, {
        size: 16
      }),
      badge: 'WDV'
    }]
  }, {
    label: 'Vessel & Schedule',
    items: [{
      key: 'VSS',
      label: 'Vessel Schedule',
      icon: /*#__PURE__*/React.createElement(IconShip, {
        size: 16
      }),
      badge: 'VSS'
    }, {
      key: 'OPS',
      label: 'Port Operations',
      icon: /*#__PURE__*/React.createElement(IconAnchor, {
        size: 16
      }),
      badge: 'OPS'
    }]
  }, {
    label: 'Equipment (EMS)',
    items: [{
      key: 'CGE',
      label: 'Movement Entry',
      icon: /*#__PURE__*/React.createElement(IconContainer, {
        size: 16
      }),
      badge: 'CGE'
    }]
  }, {
    label: 'Reports',
    items: [{
      key: 'RPT',
      label: 'Reports',
      icon: /*#__PURE__*/React.createElement(IconReport, {
        size: 16
      }),
      badge: 'RPT'
    }]
  }];
  return /*#__PURE__*/React.createElement("aside", {
    className: `app-sidebar ${collapsed ? 'collapsed' : ''}`
  }, !collapsed && groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-section"
  }, g.label), g.items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.key,
    className: `sb-item ${activeModule === it.key ? 'active' : ''}`,
    onClick: it.onClick || (() => onOpenModule(it.key, it.label))
  }, it.icon, /*#__PURE__*/React.createElement("span", null, it.label), it.badge && /*#__PURE__*/React.createElement("span", {
    className: "sb-badge"
  }, it.badge))))), collapsed && groups.flatMap(g => g.items).map(it => /*#__PURE__*/React.createElement("div", {
    key: it.key,
    className: `sb-item ${activeModule === it.key ? 'active' : ''}`,
    onClick: it.onClick || (() => onOpenModule(it.key, it.label)),
    title: it.label,
    style: {
      justifyContent: 'center',
      padding: '10px 0'
    }
  }, it.icon)));
}
Object.assign(window, {
  AppHeader,
  TabBar,
  Sidebar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nova/Dashboard.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   Home Dashboard — widgets per src/views/pages/Home/index.tsx
   ============================================================ */

function WidgetShell({
  stripe,
  title,
  subtitle,
  kpis,
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dash-card",
    style: {
      minHeight: 360
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dash-card-stripe",
    style: {
      background: stripe
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "dash-card-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "dash-card-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "dash-card-subtitle"
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      width: 24,
      height: 24,
      color: '#717680'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 14,
    color: "#717680"
  }))), kpis && /*#__PURE__*/React.createElement("div", {
    className: "kpi-strip"
  }, kpis.map((k, i) => /*#__PURE__*/React.createElement("div", {
    className: "kpi-cell",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi-value",
    style: {
      color: k.color || '#181d27'
    }
  }, k.value), /*#__PURE__*/React.createElement("div", {
    className: "kpi-label"
  }, k.label)))), /*#__PURE__*/React.createElement("div", {
    className: "dash-card-body"
  }, children));
}
function VesselScheduleWidget({
  onClose
}) {
  const rows = [{
    time: '06:30',
    day: 'Mon',
    vessel: 'MSC ELARA',
    port: 'SGSIN',
    teu: '4,200',
    voyage: 'EL042N',
    event: 'Arrival',
    status: 'On time'
  }, {
    time: '14:30',
    day: 'Mon',
    vessel: 'MV Atlantic Star',
    port: 'INNSA',
    teu: '2,400',
    voyage: 'AS0425',
    event: 'Departure',
    status: 'Delayed'
  }, {
    time: '11:00',
    day: 'Tue',
    vessel: 'COSCO Universe',
    port: 'SGSIN',
    teu: '18,900',
    voyage: 'CU009W',
    event: 'Arrival',
    status: 'On time'
  }, {
    time: '22:45',
    day: 'Tue',
    vessel: 'COSCO Universe',
    port: 'SGSIN',
    teu: '18,900',
    voyage: 'CU009W',
    event: 'Departure',
    status: 'On time'
  }, {
    time: '09:40',
    day: 'Wed',
    vessel: 'Ever Given',
    port: 'AEDXB',
    teu: '20,000',
    voyage: 'EG204N',
    event: 'Arrival',
    status: 'On time'
  }];
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#1565c0",
    title: "Vessel departure & arrival",
    subtitle: "Next 7 days \xB7 Jan 6 \u2013 Jan 12",
    onClose: onClose,
    kpis: [{
      value: 12,
      label: 'Arrivals',
      color: '#1565c0'
    }, {
      value: 9,
      label: 'Departures',
      color: '#2e7d32'
    }, {
      value: '148k',
      label: 'Total TEUs'
    }, {
      value: 3,
      label: 'Delayed',
      color: '#c62828'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717680',
      marginBottom: 6
    }
  }, "TEU throughput \xB7 next 7 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 80,
      padding: '4px 0'
    }
  }, [60, 25, 90, 70, 45, 30, 55].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      height: '100%',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: `${h * 0.6}%`,
      background: '#1565c0',
      borderRadius: '2px 2px 0 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: `${h * 0.4}%`,
      background: '#2e7d32',
      borderRadius: '2px 2px 0 0'
    }
  }), i === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: `${h * 0.5}%`,
      background: '#c62828',
      borderRadius: '2px 2px 0 0'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: '#717680'
    }
  }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      borderRadius: 6,
      boxShadow: '0 1px 3px rgba(24,29,39,0.08)',
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      background: '#f4f6fb',
      borderRadius: 5,
      padding: '4px 0',
      textAlign: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700
    }
  }, r.time), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#717680'
    }
  }, r.day)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2
    }
  }, r.event === 'Arrival' ? /*#__PURE__*/React.createElement(IconArrowDown, {
    size: 12,
    stroke: 2,
    color: "#1565c0"
  }) : /*#__PURE__*/React.createElement(IconArrowUp, {
    size: 12,
    stroke: 2,
    color: "#5e35b1"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: r.event === 'Arrival' ? '#1565c0' : '#5e35b1',
      letterSpacing: 0.45,
      textTransform: 'uppercase'
    }
  }, r.event)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#181d27',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, r.vessel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: '#717680'
    }
  }, r.port, " \xB7 ", r.teu, " TEU \xB7 ", r.voyage)), /*#__PURE__*/React.createElement(StatusChip, {
    status: r.status
  })))));
}
function AgencyBookingsWidget({
  onClose
}) {
  const agencies = [{
    name: 'Solverminds Agency',
    bookings: 142,
    change: '+12',
    color: '#6a1b9a'
  }, {
    name: 'Marit Logistics',
    bookings: 98,
    change: '+5',
    color: '#1565c0'
  }, {
    name: 'PortPro International',
    bookings: 76,
    change: '-3',
    color: '#f57c00'
  }, {
    name: 'OceanLink Services',
    bookings: 54,
    change: '+8',
    color: '#2e7d32'
  }];
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#6a1b9a",
    title: "Agency vessel bookings",
    subtitle: "This week \xB7 4 agencies",
    onClose: onClose,
    kpis: [{
      value: 370,
      label: 'Bookings'
    }, {
      value: 245,
      label: 'Confirmed',
      color: '#2e7d32'
    }, {
      value: 88,
      label: 'Pending',
      color: '#f57c00'
    }, {
      value: 37,
      label: 'Cancelled',
      color: '#c62828'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, agencies.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: '10px 12px',
      borderLeft: `6px solid ${a.color}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#181d27'
    }
  }, a.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717680'
    }
  }, a.bookings, " bookings")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: a.change.startsWith('+') ? '#2e7d32' : '#c62828'
    }
  }, a.change)))));
}
function LoadDischargeWidget({
  onClose
}) {
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#f57c00",
    title: "Load & discharge planning",
    subtitle: "Next 24 hours",
    onClose: onClose,
    kpis: [{
      value: 8,
      label: 'To load',
      color: '#f57c00'
    }, {
      value: 12,
      label: 'To discharge',
      color: '#1565c0'
    }, {
      value: '74%',
      label: 'Plan ready',
      color: '#2e7d32'
    }, {
      value: 3,
      label: 'Issues',
      color: '#c62828'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 4,
      fontSize: 11,
      color: '#717680',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 0.04,
      marginBottom: 8,
      paddingBottom: 6,
      borderBottom: '1px solid #f3f4f6'
    }
  }, /*#__PURE__*/React.createElement("div", null, "Vessel"), /*#__PURE__*/React.createElement("div", null, "Load"), /*#__PURE__*/React.createElement("div", null, "Discharge"), /*#__PURE__*/React.createElement("div", null, "Status")), [['MSC ELARA', '420', '180', 'On time'], ['Ever Given', '780', '560', 'Pending'], ['HMM Algeciras', '0', '340', 'Delayed']].map(([v, l, d, s], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 4,
      fontSize: 12,
      padding: '8px 0',
      borderBottom: i < 2 ? '1px solid #f9fafb' : 'none',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: '#181d27'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    className: "tabular"
  }, l), /*#__PURE__*/React.createElement("div", {
    className: "tabular"
  }, d), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(StatusChip, {
    status: s
  }))))));
}
function DemurrageAlertsWidget({
  onClose
}) {
  const rows = [{
    ref: 'CONT-78421',
    days: 12,
    port: 'NLRTM',
    amount: '$2,840 USD'
  }, {
    ref: 'CONT-78502',
    days: 8,
    port: 'USLAX',
    amount: '$1,560 USD'
  }, {
    ref: 'CONT-78611',
    days: 5,
    port: 'AEDXB',
    amount: '$890 USD'
  }, {
    ref: 'CONT-78680',
    days: 3,
    port: 'SGSIN',
    amount: '$420 USD'
  }];
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#c62828",
    title: "Demurrage & detention alerts",
    subtitle: "Active containers \xB7 28 total",
    onClose: onClose,
    kpis: [{
      value: 28,
      label: 'Containers',
      color: '#c62828'
    }, {
      value: 12,
      label: 'Critical',
      color: '#c62828'
    }, {
      value: '$24.1k',
      label: 'Exposure'
    }, {
      value: 6,
      label: 'Resolved',
      color: '#2e7d32'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: '10px 12px',
      borderLeft: '4px solid #c62828',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#181d27'
    }
  }, r.ref), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717680'
    }
  }, r.port, " \xB7 ", r.days, " days over free time")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#181d27',
      fontVariantNumeric: 'tabular-nums'
    }
  }, r.amount)))));
}
function EquipmentUtilizationWidget({
  onClose
}) {
  const types = [{
    type: '20ft DC',
    total: 1840,
    used: 1620,
    color: '#1565c0'
  }, {
    type: '40ft DC',
    total: 980,
    used: 840,
    color: '#2e7d32'
  }, {
    type: '40ft HC',
    total: 720,
    used: 510,
    color: '#f57c00'
  }, {
    type: '40ft RF',
    total: 240,
    used: 200,
    color: '#6a1b9a'
  }];
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#2e7d32",
    title: "Equipment utilization",
    subtitle: "By container type",
    onClose: onClose,
    kpis: [{
      value: '3.78k',
      label: 'Total fleet'
    }, {
      value: '3.17k',
      label: 'In use',
      color: '#2e7d32'
    }, {
      value: '83.9%',
      label: 'Utilization',
      color: '#2e7d32'
    }, {
      value: 612,
      label: 'Available'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, types.map((t, i) => {
    const pct = Math.round(t.used / t.total * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: '#fff',
        borderRadius: 6,
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 4,
        height: 18,
        background: t.color,
        borderRadius: 2
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#181d27'
      }
    }, t.type)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#717680'
      }
    }, t.used.toLocaleString(), " / ", t.total.toLocaleString(), " ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#181d27',
        marginLeft: 6
      }
    }, pct, "%"))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: '#f3f4f6',
        borderRadius: 3,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: '100%',
        background: t.color,
        borderRadius: 3
      }
    })));
  })));
}
function BillOfLadingWidget({
  onClose
}) {
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#6a1b9a",
    title: "Bill of lading processing",
    subtitle: "Today \xB7 38 documents",
    onClose: onClose,
    kpis: [{
      value: 38,
      label: 'Total'
    }, {
      value: 22,
      label: 'Approved',
      color: '#2e7d32'
    }, {
      value: 12,
      label: 'In review',
      color: '#f57c00'
    }, {
      value: 4,
      label: 'Rejected',
      color: '#c62828'
    }]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: '#181d27',
      marginBottom: 8
    }
  }, "Processing pipeline"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      height: 32,
      borderRadius: 4,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 22,
      background: '#2e7d32',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700
    }
  }, "22"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 12,
      background: '#f57c00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700
    }
  }, "12"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 4,
      background: '#c62828',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700
    }
  }, "4")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 10,
      fontSize: 10,
      color: '#717680'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Approved"), /*#__PURE__*/React.createElement("span", null, "In review"), /*#__PURE__*/React.createElement("span", null, "Rejected"))));
}
function TasksWidget({
  onClose
}) {
  const [done, setDone] = React.useState([1]);
  const tasks = [{
    id: 0,
    label: 'Review demurrage waiver requests',
    meta: 'Due today · 3 items',
    color: '#c62828'
  }, {
    id: 1,
    label: 'Approve Receipt RCT-00482',
    meta: 'Due tomorrow',
    color: '#1565c0'
  }, {
    id: 2,
    label: 'Reconcile container movement',
    meta: 'In 2 days',
    color: '#f57c00'
  }, {
    id: 3,
    label: 'Submit weekly agency report',
    meta: 'Fri',
    color: '#2e7d32'
  }];
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#0d9488",
    title: "Tasks to-do",
    subtitle: "4 active \xB7 1 completed",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, tasks.map(t => {
    const isDone = done.includes(t.id);
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        background: '#fff',
        borderRadius: 6,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderLeft: `3px solid ${isDone ? '#dee2e6' : t.color}`,
        cursor: 'pointer',
        opacity: isDone ? 0.55 : 1
      },
      onClick: () => setDone(isDone ? done.filter(d => d !== t.id) : [...done, t.id])
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 16,
        height: 16,
        borderRadius: 9999,
        border: `1.5px solid ${isDone ? '#1cbb8c' : '#d1d5db'}`,
        background: isDone ? '#1cbb8c' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, isDone && /*#__PURE__*/React.createElement(IconCheck, {
      size: 10,
      color: "#fff",
      stroke: 3
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: '#181d27',
        textDecoration: isDone ? 'line-through' : 'none'
      }
    }, t.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#717680',
        marginTop: 1
      }
    }, t.meta)));
  })));
}
function RemindersWidget({
  onClose
}) {
  return /*#__PURE__*/React.createElement(WidgetShell, {
    stripe: "#0d9488",
    title: "Reminders & alerts",
    subtitle: "Within 7 days",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, [{
    day: 'Tomorrow',
    label: 'Vessel arrival',
    detail: 'COSCO Universe — SGSIN',
    tone: '#1565c0'
  }, {
    day: 'Jan 10',
    label: 'Tariff renewal',
    detail: '3 tariffs expiring',
    tone: '#f57c00'
  }, {
    day: 'Jan 12',
    label: 'Audit window',
    detail: 'Q4 reconciliation',
    tone: '#0d9488'
  }].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      borderRadius: 6,
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 9999,
      background: r.tone,
      marginTop: 6,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717680',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.04
    }
  }, r.day), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#181d27',
      marginTop: 2
    }
  }, r.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717680',
      marginTop: 2
    }
  }, r.detail))))));
}
function Dashboard({
  user
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "dash-page-bg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "sm-text-h1",
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: '#181d27',
      letterSpacing: '-0.01em'
    }
  }, "Dashboard"), /*#__PURE__*/React.createElement("div", {
    className: "sm-text-p",
    style: {
      fontSize: 12,
      color: '#717680',
      marginTop: 4
    }
  }, "Welcome back, ", user?.name?.split(' ')[0] || 'Divya', " \xB7 ", new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: 'span 9',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(VesselScheduleWidget, null), /*#__PURE__*/React.createElement(AgencyBookingsWidget, null), /*#__PURE__*/React.createElement(LoadDischargeWidget, null), /*#__PURE__*/React.createElement(EquipmentUtilizationWidget, null), /*#__PURE__*/React.createElement(DemurrageAlertsWidget, null), /*#__PURE__*/React.createElement(BillOfLadingWidget, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: 'span 3',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(TasksWidget, null), /*#__PURE__*/React.createElement(RemindersWidget, null))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nova/Login.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   Login screen — based on AuthLogin.js, simplified
   ============================================================ */

const {
  useState: useLoginState
} = React;
function Login({
  onSignedIn
}) {
  const [username, setUsername] = useLoginState('divami');
  const [password, setPassword] = useLoginState('demo123');
  const [showPw, setShowPw] = useLoginState(false);
  const [error, setError] = useLoginState('');
  function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    onSignedIn({
      name: username === 'divami' ? 'Divya Loganathan' : username,
      agency: 'SVMOB · Singapore'
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: `linear-gradient(rgba(13,33,136,0.55), rgba(13,33,136,0.7)), url('../../assets/login_bg.png') center/cover no-repeat, #0d2188`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'Inter, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
      width: 920,
      maxWidth: '100%',
      minHeight: 540,
      display: 'flex',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'linear-gradient(160deg, #3b7ddd 0%, #0d2188 100%)',
      color: '#fff',
      padding: 40,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 0.04
    }
  }, "CLOUD ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#F26722'
    }
  }, "LRP")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.7,
      marginTop: 4
    }
  }, "Reaching new heights")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.25,
      maxWidth: 340
    }
  }, "Welcome to Nova"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      opacity: 0.85,
      marginTop: 10,
      maxWidth: 340,
      lineHeight: 1.6
    }
  }, "Shipping & logistics operations \u2014 agency, voyages, equipment, invoicing & settlements.")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.7
    }
  }, "\xA9 Solverminds \xB7 v3.0"), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/ship-container.png",
    alt: "",
    style: {
      position: 'absolute',
      right: -32,
      bottom: -10,
      width: 280,
      opacity: 0.15
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '48px 56px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "sm-text-h2",
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: '#0e0e0e',
      margin: 0
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    className: "sm-text-p",
    style: {
      fontSize: 12,
      color: '#717680',
      marginTop: 6
    }
  }, "Enter your Nova credentials to continue."), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    style: {
      marginTop: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Username",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    name: "username",
    value: username,
    onChange: e => setUsername(e.target.value),
    placeholder: "username",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Password",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    type: showPw ? 'text' : 'password',
    value: password,
    onChange: e => setPassword(e.target.value),
    style: {
      paddingRight: 36
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowPw(!showPw),
    style: {
      position: 'absolute',
      right: 6,
      top: 4,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#717171',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement(IconEye, {
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(SCheckBox, {
    name: "remember",
    value: true,
    label: "Keep me signed in",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("a", {
    className: "sm-action-btn-text",
    href: "#",
    style: {
      color: '#0a91ff',
      fontSize: 12,
      fontWeight: 500,
      textTransform: 'uppercase',
      textDecoration: 'none'
    }
  }, "Forgot password?")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#dc3545',
      fontSize: 12
    }
  }, error), /*#__PURE__*/React.createElement(SButton, {
    text: "Sign in",
    type: "submit",
    onClick: handleSubmit
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
      color: '#a1a1a1',
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: '#e9ecef'
    }
  }), /*#__PURE__*/React.createElement("span", null, "OR"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: '#e9ecef'
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      background: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 500,
      color: '#495057'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 2,
      width: 16,
      height: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#F25022'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#7FBA00'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#00A4EF'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#FFB900'
    }
  })), "Login with Microsoft")))));
}
Object.assign(window, {
  Login
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nova/ReceiptList.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   Receipt module (IMP / RCE)
   v3 pattern reference — mirrors src/svm/IMP/RCE/{Receipt,receiptPages}.tsx

   Internal views: landing → listing → create (wizard) → details
   Wrapped in <SMainCard className="sm-nova-container"> + <SVersionPanel/>
   ============================================================ */

const {
  useState: useRcState,
  useMemo: useRcMemo,
  useEffect: useRcEffect
} = React;

/* ---------- Demo data ---------- */
const RCT_INITIAL = [{
  id: '01',
  receiptNo: 'RCT-00482',
  receiptDate: '2026-01-09',
  invoiceNo: 'INV-2026-0142',
  invoiceCategory: 'Freight',
  invoiceDate: '2026-01-04',
  invoiceType: 'Original',
  blNo: 'MSCUEL004821',
  totalAmount: '12,540.00',
  currentPayment: '12,540.00',
  balanceAmount: '0.00',
  service: 'EUR-FE',
  vessel: 'MSC ELARA',
  voyage: 'EL042N',
  status: 'Posted',
  customer: 'Solverminds Agency'
}, {
  id: '02',
  receiptNo: 'RCT-00481',
  receiptDate: '2026-01-09',
  invoiceNo: 'INV-2026-0141',
  invoiceCategory: 'Local',
  invoiceDate: '2026-01-04',
  invoiceType: 'Original',
  blNo: 'COSCU009W22',
  totalAmount: '4,820.00',
  currentPayment: '2,000.00',
  balanceAmount: '2,820.00',
  service: 'TPS-W',
  vessel: 'COSCO Universe',
  voyage: 'CU009W',
  status: 'Partial',
  customer: 'Marit Logistics'
}, {
  id: '03',
  receiptNo: 'RCT-00480',
  receiptDate: '2026-01-08',
  invoiceNo: 'INV-2026-0139',
  invoiceCategory: 'Demurrage',
  invoiceDate: '2026-01-02',
  invoiceType: 'Original',
  blNo: 'EVGNEG204N1',
  totalAmount: '2,840.00',
  currentPayment: '2,840.00',
  balanceAmount: '0.00',
  service: 'AGX-N',
  vessel: 'Ever Given',
  voyage: 'EG204N',
  status: 'Posted',
  customer: 'PortPro International'
}, {
  id: '04',
  receiptNo: 'RCT-00479',
  receiptDate: '2026-01-08',
  invoiceNo: 'INV-2026-0136',
  invoiceCategory: 'Freight',
  invoiceDate: '2026-01-01',
  invoiceType: 'Original',
  blNo: 'HMMHA051S0',
  totalAmount: '23,964.00',
  currentPayment: '0.00',
  balanceAmount: '23,964.00',
  service: 'EUR-FE',
  vessel: 'HMM Algeciras',
  voyage: 'HA051S',
  status: 'Draft',
  customer: 'Solverminds Agency'
}, {
  id: '05',
  receiptNo: 'RCT-00478',
  receiptDate: '2026-01-07',
  invoiceNo: 'INV-2026-0134',
  invoiceCategory: 'Detention',
  invoiceDate: '2025-12-30',
  invoiceType: 'Credit',
  blNo: 'ONEONOI014E',
  totalAmount: '1,560.00',
  currentPayment: '1,560.00',
  balanceAmount: '0.00',
  service: 'TPS-E',
  vessel: 'ONE Innovation',
  voyage: 'OI014E',
  status: 'Posted',
  customer: 'OceanLink Services'
}, {
  id: '06',
  receiptNo: 'RCT-00477',
  receiptDate: '2026-01-06',
  invoiceNo: 'INV-2026-0130',
  invoiceCategory: 'Freight',
  invoiceDate: '2025-12-28',
  invoiceType: 'Original',
  blNo: 'CMACMP077W',
  totalAmount: '8,210.00',
  currentPayment: '8,210.00',
  balanceAmount: '0.00',
  service: 'EUR-FE',
  vessel: 'CMA CGM Marco Polo',
  voyage: 'MP077W',
  status: 'Posted',
  customer: 'Marit Logistics'
}, {
  id: '07',
  receiptNo: 'RCT-00476',
  receiptDate: '2026-01-05',
  invoiceNo: 'INV-2026-0128',
  invoiceCategory: 'Local',
  invoiceDate: '2025-12-27',
  invoiceType: 'Original',
  blNo: 'MSCAS04258',
  totalAmount: '920.00',
  currentPayment: '0.00',
  balanceAmount: '920.00',
  service: 'TPS-W',
  vessel: 'MV Atlantic Star',
  voyage: 'AS0425',
  status: 'Cancelled',
  customer: 'PortPro International'
}, {
  id: '08',
  receiptNo: 'RCT-00475',
  receiptDate: '2026-01-05',
  invoiceNo: 'INV-2026-0125',
  invoiceCategory: 'Freight',
  invoiceDate: '2025-12-26',
  invoiceType: 'Original',
  blNo: 'MSCUEL004810',
  totalAmount: '15,400.00',
  currentPayment: '15,400.00',
  balanceAmount: '0.00',
  service: 'EUR-FE',
  vessel: 'MSC ELARA',
  voyage: 'EL041N',
  status: 'Posted',
  customer: 'Solverminds Agency'
}];
const CUSTOMER_OPTIONS = [{
  id: 'C001',
  title: 'Solverminds Agency'
}, {
  id: 'C002',
  title: 'Marit Logistics'
}, {
  id: 'C003',
  title: 'PortPro International'
}, {
  id: 'C004',
  title: 'OceanLink Services'
}];
const CURRENCY_OPTIONS = [{
  id: 'USD',
  title: 'USD — US Dollar'
}, {
  id: 'SGD',
  title: 'SGD — Singapore Dollar'
}, {
  id: 'EUR',
  title: 'EUR — Euro'
}];
const PAY_MODE_OPTIONS = [{
  id: 'WIRE',
  title: 'Wire Transfer'
}, {
  id: 'CHEQ',
  title: 'Cheque'
}, {
  id: 'CASH',
  title: 'Cash'
}, {
  id: 'CARD',
  title: 'Card'
}];
const PAY_AT_OPTIONS = [{
  id: 'SG-HQ',
  title: 'Singapore HQ'
}, {
  id: 'IN-MUM',
  title: 'Mumbai Branch'
}, {
  id: 'AE-DXB',
  title: 'Dubai Office'
}];
const RECEIPT_BY_OPTIONS = [{
  id: 'CUST',
  title: 'Customer'
}, {
  id: 'AGNT',
  title: 'Agent'
}];

/* ============================================================
   1) LANDING PAGE — uses SQuickLinksLanding
   ============================================================ */
function ReceiptLandingPage({
  onCreate,
  onList,
  onShowToast
}) {
  const [search, setSearch] = useRcState('');
  const quickLinks = [{
    id: 'create',
    label: 'Create receipt',
    icon: /*#__PURE__*/React.createElement(IconPlus, {
      size: 20,
      stroke: 2
    }),
    onClick: () => onCreate()
  }, {
    id: 'list',
    label: 'View all receipts',
    icon: /*#__PURE__*/React.createElement(IconList, {
      size: 20,
      stroke: 2
    }),
    onClick: onList
  }, {
    id: 'recent',
    label: 'Recent receipts',
    icon: /*#__PURE__*/React.createElement(IconClock, {
      size: 20,
      stroke: 2
    }),
    onClick: onList
  }, {
    id: 'reports',
    label: 'Reports',
    icon: /*#__PURE__*/React.createElement(IconReport, {
      size: 20,
      stroke: 2
    }),
    onClick: () => onShowToast('info', 'Reports', 'Opening receipts report builder…')
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "sm-landing-content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sm-text-h3",
    style: {
      fontSize: 18,
      fontWeight: 600,
      color: '#0e0e0e'
    }
  }, "Receipts")), /*#__PURE__*/React.createElement("div", {
    className: "sm-text-p",
    style: {
      fontSize: 13,
      color: '#717680',
      marginBottom: 20,
      maxWidth: 640
    }
  }, "Record customer payments against open invoices, allocate by charge head, and post to the ledger."), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 672,
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(SBasicSearch, {
    name: "rce-landing-search",
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search by receipt no, invoice no, BL, vessel\u2026"
  })), /*#__PURE__*/React.createElement("h5", {
    className: "sm-text-h5",
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: '#0e0e0e',
      marginBottom: 12
    }
  }, "Quick links"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 14,
      maxWidth: 940
    }
  }, quickLinks.map(q => /*#__PURE__*/React.createElement("button", {
    key: q.id,
    className: "quick-link-card",
    onClick: q.onClick
  }, /*#__PURE__*/React.createElement("div", {
    className: "qlc-icon"
  }, q.icon), /*#__PURE__*/React.createElement("div", {
    className: "qlc-title"
  }, q.label)))));
}

/* ============================================================
   2) LISTING PAGE — WizardHeader + full-height SAgGrid
   ============================================================ */
function ReceiptListingPage({
  rows,
  onBack,
  onCreate,
  onViewDetail,
  onDelete
}) {
  const [search, setSearch] = useRcState('');
  const [recentOnly, setRecentOnly] = useRcState(false);
  const [selectedId, setSelectedId] = useRcState(null);
  const filtered = useRcMemo(() => {
    const q = search.trim().toLowerCase();
    let r = rows;
    if (q) r = r.filter(row => [row.receiptNo, row.invoiceNo, row.blNo, row.vessel, row.voyage, row.customer].some(v => String(v ?? '').toLowerCase().includes(q)));
    if (recentOnly) r = [...r].sort((a, b) => b.receiptDate.localeCompare(a.receiptDate)).slice(0, 5);
    return r;
  }, [rows, search, recentOnly]);
  const cols = [{
    field: 'receiptNo',
    label: 'Receipt no',
    width: 130
  }, {
    field: 'receiptDate',
    label: 'Receipt date',
    width: 110
  }, {
    field: 'invoiceNo',
    label: 'Invoice no',
    width: 140
  }, {
    field: 'invoiceCategory',
    label: 'Invoice category',
    width: 130
  }, {
    field: 'invoiceDate',
    label: 'Invoice date',
    width: 110
  }, {
    field: 'invoiceType',
    label: 'Invoice type',
    width: 110
  }, {
    field: 'blNo',
    label: 'BL no',
    width: 140
  }, {
    field: 'totalAmount',
    label: 'Total amount',
    width: 120,
    align: 'right'
  }, {
    field: 'currentPayment',
    label: 'Current payment',
    width: 130,
    align: 'right'
  }, {
    field: 'balanceAmount',
    label: 'Balance amount',
    width: 130,
    align: 'right'
  }, {
    field: 'service',
    label: 'Service',
    width: 90
  }, {
    field: 'vessel',
    label: 'Vessel',
    width: 160
  }, {
    field: 'voyage',
    label: 'Voyage',
    width: 90
  }, {
    field: 'status',
    label: 'Status',
    width: 100
  }];
  const totalW = cols.reduce((s, c) => s + c.width, 0) + 56;
  return /*#__PURE__*/React.createElement("div", {
    className: "flex-col flex-1",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(WizardHeader, {
    title: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", null, "View Receipts"), /*#__PURE__*/React.createElement("div", {
      className: "divider-vert"
    }), /*#__PURE__*/React.createElement(SFilterChip, {
      label: "Recent",
      selected: recentOnly,
      onClick: () => setRecentOnly(!recentOnly)
    })),
    onBack: onBack,
    rightContent: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220
      }
    }, /*#__PURE__*/React.createElement(SBasicSearch, {
      name: "rce-list-search",
      value: search,
      onChange: e => setSearch(e.target.value),
      placeholder: "Search"
    })), /*#__PURE__*/React.createElement("div", {
      className: "divider-vert"
    }), /*#__PURE__*/React.createElement("button", {
      className: "icon-btn",
      style: {
        background: '#f3f4f6',
        color: '#495057'
      },
      title: "Filter"
    }, /*#__PURE__*/React.createElement(IconFilter, {
      size: 16,
      color: "#495057"
    })), /*#__PURE__*/React.createElement(SButton, {
      text: "+ Create Receipt",
      onClick: onCreate
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "sm-aggrid",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto',
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: totalW,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ag-header",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    style: {
      accentColor: '#0a91ff'
    }
  })), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.field,
    className: "ag-header-cell",
    style: {
      width: c.width,
      flexShrink: 0,
      justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start'
    }
  }, c.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 600,
      color: '#1a1a1a',
      flexShrink: 0
    }
  }, "\u2014")), /*#__PURE__*/React.createElement("div", {
    className: "ag-body",
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 28,
      textAlign: 'center',
      color: '#717171',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/norecordfound.png",
    alt: "No records",
    style: {
      width: 100,
      opacity: 0.75
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, "No receipts match your search.")), filtered.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: `ag-row ${selectedId === r.id ? 'selected' : ''}`,
    onClick: () => setSelectedId(r.id),
    onDoubleClick: () => onViewDetail(r),
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: selectedId === r.id,
    onChange: () => setSelectedId(selectedId === r.id ? null : r.id),
    style: {
      accentColor: '#0a91ff'
    }
  })), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.field,
    className: "ag-cell",
    style: {
      width: c.width,
      flexShrink: 0,
      textAlign: c.align === 'right' ? 'right' : 'left',
      justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start',
      display: 'flex',
      alignItems: 'center',
      fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal'
    }
  }, c.field === 'receiptNo' ? /*#__PURE__*/React.createElement("a", {
    className: "sm-action-btn-text",
    onClick: e => {
      e.stopPropagation();
      onViewDetail(r);
    },
    style: {
      cursor: 'pointer'
    }
  }, r[c.field]) : c.field === 'status' ? /*#__PURE__*/React.createElement(StatusChip, {
    status: r.status
  }) : r[c.field])), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      flexShrink: 0
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      color: '#495057',
      width: 24,
      height: 24
    },
    title: "Edit"
  }, /*#__PURE__*/React.createElement(IconPencil, {
    size: 14,
    color: "#495057"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      color: '#dc3545',
      width: 24,
      height: 24
    },
    title: "Delete",
    onClick: () => onDelete(r)
  }, /*#__PURE__*/React.createElement(IconTrash, {
    size: 14,
    color: "#dc3545"
  })))))))), /*#__PURE__*/React.createElement("div", {
    className: "ag-footer"
  }, /*#__PURE__*/React.createElement("span", null, filtered.length, " of ", rows.length, " record", rows.length === 1 ? '' : 's'), selectedId && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#0a91ff'
    }
  }, "\xB7 1 selected"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      width: 22,
      height: 22,
      color: '#495057'
    },
    title: "Refresh"
  }, /*#__PURE__*/React.createElement(IconRefresh, {
    size: 14,
    color: "#495057"
  })), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      width: 22,
      height: 22,
      color: '#495057'
    },
    title: "Export"
  }, /*#__PURE__*/React.createElement(IconDownload, {
    size: 14,
    color: "#495057"
  })))));
}
Object.assign(window, {
  ReceiptLandingPage,
  ReceiptListingPage,
  RCT_INITIAL,
  CUSTOMER_OPTIONS,
  CURRENCY_OPTIONS,
  PAY_MODE_OPTIONS,
  PAY_AT_OPTIONS,
  RECEIPT_BY_OPTIONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/ReceiptList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nova/ReceiptWizard.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   Receipt module — Wizard + Details pages
   ============================================================ */

const {
  useState: useRwState,
  useMemo: useRwMemo,
  useEffect: useRwEffect
} = React;
function nextReceiptNo(rows) {
  const nums = rows.map(r => parseInt(String(r.receiptNo).replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 480;
  return 'RCT-' + String(max + 1).padStart(5, '0');
}

/* ============================================================
   STEPPER
   ============================================================ */
function Stepper({
  steps,
  current
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, steps.map((s, i) => {
    const done = i < current;
    const active = i === current;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s
    }, /*#__PURE__*/React.createElement("div", {
      className: `step ${active ? 'active' : ''} ${done ? 'done' : ''}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "step-circle"
    }, done ? /*#__PURE__*/React.createElement(IconCheck, {
      size: 14,
      color: "#fff",
      stroke: 3
    }) : i + 1), /*#__PURE__*/React.createElement("div", {
      className: "step-label"
    }, s)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
      className: "step-line",
      style: {
        background: done ? '#1cbb8c' : '#dee2e6'
      }
    }));
  }));
}

/* ============================================================
   WIZARD PAGE
   ============================================================ */
function ReceiptWizardPage({
  existingRows,
  onCancel,
  onSaved,
  onShowToast
}) {
  const STEPS = ['Receipt details', 'Invoice & payment', 'Allocations', 'Review'];
  const [step, setStep] = useRwState(0);
  const [form, setForm] = useRwState({
    receiptNo: nextReceiptNo(existingRows),
    receiptDate: new Date().toISOString().slice(0, 10),
    receiptBy: 'CUST',
    customer: 'C001',
    currency: 'USD',
    paymentMode: 'WIRE',
    paymentAt: 'SG-HQ',
    invoiceNo: 'INV-2026-0143',
    invoiceCategory: 'Freight',
    invoiceDate: '2026-01-04',
    blNo: 'MSCUEL004822',
    totalAmount: '8,500.00',
    currentPayment: '8,500.00',
    remarks: ''
  });
  const [allocations, setAllocations] = useRwState([{
    id: 1,
    head: 'Ocean freight',
    invoiced: '6,200.00',
    allocated: '6,200.00'
  }, {
    id: 2,
    head: 'BAF surcharge',
    invoiced: '1,400.00',
    allocated: '1,400.00'
  }, {
    id: 3,
    head: 'Terminal handling',
    invoiced: '900.00',
    allocated: '900.00'
  }]);
  function setField(name, value) {
    setForm(f => ({
      ...f,
      [name]: value
    }));
  }
  const labelOfCust = CUSTOMER_OPTIONS.find(c => c.id === form.customer)?.title || '';
  const labelOfCur = CURRENCY_OPTIONS.find(c => c.id === form.currency)?.title || '';
  const labelOfMode = PAY_MODE_OPTIONS.find(c => c.id === form.paymentMode)?.title || '';
  function canProceed() {
    if (step === 0) return form.receiptNo && form.customer && form.currency && form.paymentMode;
    if (step === 1) return form.invoiceNo && form.totalAmount;
    if (step === 2) return allocations.length > 0;
    return true;
  }
  function handleNext() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function handleSave() {
    const row = {
      id: String(Date.now()),
      receiptNo: form.receiptNo,
      receiptDate: form.receiptDate,
      invoiceNo: form.invoiceNo,
      invoiceCategory: form.invoiceCategory,
      invoiceDate: form.invoiceDate,
      invoiceType: 'Original',
      blNo: form.blNo,
      totalAmount: form.totalAmount,
      currentPayment: form.currentPayment,
      balanceAmount: '0.00',
      service: 'EUR-FE',
      vessel: 'MSC ELARA',
      voyage: 'EL042N',
      status: 'Draft',
      customer: labelOfCust,
      currency: form.currency,
      paymentMode: labelOfMode,
      paymentAt: PAY_AT_OPTIONS.find(c => c.id === form.paymentAt)?.title || '',
      remarks: form.remarks,
      allocations: allocations.slice()
    };
    onSaved(row);
    onShowToast('success', 'Saved successfully', `Receipt ${form.receiptNo} created and posted to ledger.`);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "flex-col flex-1",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(WizardHeader, {
    title: "Create Receipt",
    onBack: onCancel,
    rightContent: /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: '#717680'
      }
    }, "Receipt no: ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: '#0e0e0e',
        fontFamily: 'monospace'
      }
    }, form.receiptNo), /*#__PURE__*/React.createElement(StatusChip, {
      status: "Draft"
    }))
  }), /*#__PURE__*/React.createElement(Stepper, {
    steps: STEPS,
    current: step
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 scroll-y",
    style: {
      padding: '14px 4px 8px',
      minHeight: 0,
      overflowY: 'auto'
    }
  }, step === 0 && /*#__PURE__*/React.createElement(ReceiptDetailsStep, {
    form: form,
    setField: setField
  }), step === 1 && /*#__PURE__*/React.createElement(InvoicePaymentStep, {
    form: form,
    setField: setField
  }), step === 2 && /*#__PURE__*/React.createElement(AllocationsStep, {
    allocations: allocations,
    setAllocations: setAllocations,
    form: form
  }), step === 3 && /*#__PURE__*/React.createElement(ReviewStep, {
    form: form,
    allocations: allocations,
    customer: labelOfCust,
    currency: labelOfCur,
    mode: labelOfMode
  })), /*#__PURE__*/React.createElement(WizardFooter, {
    onBack: step > 0 ? () => setStep(step - 1) : null,
    onCancel: onCancel,
    onNext: step < STEPS.length - 1 ? handleNext : handleSave,
    nextLabel: step < STEPS.length - 1 ? 'Next' : 'Save & Post',
    disabled: !canProceed()
  }));
}

/* ---- Step 1: Receipt details ---- */
function ReceiptDetailsStep({
  form,
  setField
}) {
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Receipt details"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Receipt no",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.receiptNo,
    onChange: e => setField('receiptNo', e.target.value),
    disabled: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Receipt date",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    type: "date",
    value: form.receiptDate,
    onChange: e => setField('receiptDate', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Received from",
    required: true
  }), /*#__PURE__*/React.createElement("select", {
    className: "sm-select-combo",
    value: form.receiptBy,
    onChange: e => setField('receiptBy', e.target.value)
  }, RECEIPT_BY_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title)))), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Customer",
    required: true
  }), /*#__PURE__*/React.createElement("select", {
    className: "sm-select-combo",
    value: form.customer,
    onChange: e => setField('customer', e.target.value)
  }, CUSTOMER_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title)))), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Currency",
    required: true
  }), /*#__PURE__*/React.createElement("select", {
    className: "sm-select-combo",
    value: form.currency,
    onChange: e => setField('currency', e.target.value)
  }, CURRENCY_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title)))), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Payment mode",
    required: true
  }), /*#__PURE__*/React.createElement("select", {
    className: "sm-select-combo",
    value: form.paymentMode,
    onChange: e => setField('paymentMode', e.target.value)
  }, PAY_MODE_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Payment payable at"
  }), /*#__PURE__*/React.createElement("select", {
    className: "sm-select-combo",
    value: form.paymentAt,
    onChange: e => setField('paymentAt', e.target.value)
  }, PAY_AT_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Reference no"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    placeholder: "External ref"
  }))));
}

/* ---- Step 2: Invoice + payment ---- */
function InvoicePaymentStep({
  form,
  setField
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Match against invoice"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Invoice no",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.invoiceNo,
    onChange: e => setField('invoiceNo', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Invoice category"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.invoiceCategory,
    onChange: e => setField('invoiceCategory', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Invoice date"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    type: "date",
    value: form.invoiceDate,
    onChange: e => setField('invoiceDate', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "BL no"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.blNo,
    onChange: e => setField('blNo', e.target.value)
  })))), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Amount"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Total amount",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.totalAmount,
    onChange: e => setField('totalAmount', e.target.value),
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "sm-mandatory"
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Current payment",
    required: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: form.currentPayment,
    onChange: e => setField('currentPayment', e.target.value),
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Bank charges"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    placeholder: "0.00",
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    text: "Withholding tax"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    placeholder: "0.00",
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SLabel, {
    text: "Remarks"
  }), /*#__PURE__*/React.createElement("textarea", {
    className: "sm-input-form-control",
    rows: 2,
    value: form.remarks,
    onChange: e => setField('remarks', e.target.value),
    placeholder: "Optional notes for the ledger entry"
  }))));
}

/* ---- Step 3: Allocations table ---- */
function AllocationsStep({
  allocations,
  setAllocations,
  form
}) {
  function setAmount(id, v) {
    setAllocations(allocations.map(a => a.id === id ? {
      ...a,
      allocated: v
    } : a));
  }
  function addRow() {
    setAllocations([...allocations, {
      id: Date.now(),
      head: '',
      invoiced: '0.00',
      allocated: '0.00'
    }]);
  }
  function removeRow(id) {
    setAllocations(allocations.filter(a => a.id !== id));
  }
  const total = allocations.reduce((s, a) => s + (parseFloat(String(a.allocated).replace(/,/g, '')) || 0), 0);
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Charge allocations"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#717680',
      marginBottom: 10
    }
  }, "Allocate the ", form.currency, " ", form.currentPayment, " payment across charge heads. Must equal the current payment."), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px 56px',
      background: '#EAF6FF',
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 600,
      color: '#1a1a1a'
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Charge head"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Invoiced amount"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Allocated amount"), /*#__PURE__*/React.createElement("div", null)), allocations.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px 56px',
      alignItems: 'center',
      padding: '6px 12px',
      fontSize: 12,
      borderTop: '1px solid rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", null, i + 1), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: a.head,
    onChange: e => setAllocations(allocations.map(x => x.id === a.id ? {
      ...x,
      head: e.target.value
    } : x)),
    placeholder: "Select charge head"
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: a.invoiced,
    readOnly: true,
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      background: '#f9fafb'
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "sm-input-form-control",
    value: a.allocated,
    onChange: e => setAmount(a.id, e.target.value),
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      color: '#dc3545'
    },
    onClick: () => removeRow(a.id),
    title: "Remove"
  }, /*#__PURE__*/React.createElement(IconTrash, {
    size: 14,
    color: "#dc3545"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "sm-action-btn",
    onClick: addRow
  }, /*#__PURE__*/React.createElement(IconPlus, {
    size: 14
  }), " ", /*#__PURE__*/React.createElement("span", {
    className: "sm-action-btn-text"
  }, "Add row")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#717680'
    }
  }, "Total allocated: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#0e0e0e',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 14
    }
  }, total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }), " ", form.currency))));
}

/* ---- Step 4: Review ---- */
function ReviewStep({
  form,
  allocations,
  customer,
  currency,
  mode
}) {
  function Item({
    label,
    value
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "sm-info-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "sm-title-text-12-7f",
      style: {
        color: '#707070'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "sm-title-text-14-bold",
      style: {
        color: '#0e0e0e',
        fontWeight: 600
      }
    }, value));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Review & confirm"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Item, {
    label: "Receipt no",
    value: form.receiptNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Receipt date",
    value: form.receiptDate
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Customer",
    value: customer
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Currency",
    value: currency.split(' — ')[0]
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Payment mode",
    value: mode
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Invoice no",
    value: form.invoiceNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "BL no",
    value: form.blNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Total amount",
    value: `${form.totalAmount} ${form.currency}`
  }))), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Allocations (", allocations.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px',
      background: '#EAF6FF',
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Charge head"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Invoiced"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Allocated")), allocations.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px',
      padding: '8px 12px',
      fontSize: 12,
      borderTop: '1px solid rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", null, i + 1), /*#__PURE__*/React.createElement("div", null, a.head), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, a.invoiced), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, a.allocated))))));
}

/* ============================================================
   DETAILS PAGE — read-only summary
   ============================================================ */
function ReceiptDetailsPage({
  row,
  onBack,
  onEdit,
  onDelete
}) {
  const [tab, setTab] = useRwState('summary');
  function Item({
    label,
    value,
    span = 1
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "sm-info-item",
      style: {
        gridColumn: `span ${span}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sm-title-text-12-7f",
      style: {
        color: '#707070',
        fontSize: 12
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      className: "sm-title-text-14",
      style: {
        color: '#0e0e0e',
        fontSize: 13,
        fontWeight: 500
      }
    }, value || '—'));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "flex-col flex-1",
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(WizardHeader, {
    title: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", null, "Receipt ", row.receiptNo), /*#__PURE__*/React.createElement(StatusChip, {
      status: row.status
    })),
    onBack: onBack,
    rightContent: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn outlined-primary",
      style: {
        background: '#fff',
        color: '#0a91ff',
        border: '1px solid #0a91ff',
        padding: '6px 14px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(IconPrint, {
      size: 14
    }), " Print"), /*#__PURE__*/React.createElement("button", {
      className: "btn outlined-error",
      style: {
        background: '#fff',
        color: '#d32f2f',
        border: '1px solid #d32f2f',
        padding: '6px 14px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer'
      },
      onClick: onDelete
    }, /*#__PURE__*/React.createElement(IconTrash, {
      size: 14
    }), " Delete"), /*#__PURE__*/React.createElement(SButton, {
      text: "Edit",
      onClick: () => onEdit(row)
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '1px solid #e9ecef',
      gap: 4,
      padding: '4px 0 0',
      flexShrink: 0
    }
  }, [['summary', 'Summary'], ['allocations', 'Allocations'], ['ledger', 'Ledger entries'], ['audit', 'Audit trail']].map(([k, label]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "tab",
    onClick: () => setTab(k),
    style: {
      background: tab === k ? '#fff' : 'transparent',
      color: tab === k ? '#0a91ff' : '#495057',
      fontWeight: tab === k ? 600 : 500,
      borderBottom: tab === k ? '2px solid #0a91ff' : '2px solid transparent',
      borderRadius: 0,
      padding: '8px 14px'
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 scroll-y",
    style: {
      padding: '16px 4px 8px',
      minHeight: 0,
      overflowY: 'auto'
    }
  }, tab === 'summary' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Receipt"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 18,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Item, {
    label: "Receipt no",
    value: row.receiptNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Receipt date",
    value: row.receiptDate
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Customer",
    value: row.customer
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Currency",
    value: row.currency || 'USD'
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Payment mode",
    value: row.paymentMode || 'Wire Transfer'
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Payable at",
    value: row.paymentAt || 'Singapore HQ'
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Status",
    value: row.status
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Reference no",
    value: "\u2014"
  }))), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Invoice"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 18,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Item, {
    label: "Invoice no",
    value: row.invoiceNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Invoice date",
    value: row.invoiceDate
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Invoice category",
    value: row.invoiceCategory
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Invoice type",
    value: row.invoiceType
  }), /*#__PURE__*/React.createElement(Item, {
    label: "BL no",
    value: row.blNo
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Service",
    value: row.service
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Vessel",
    value: row.vessel
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Voyage",
    value: row.voyage
  }))), /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Amount"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 18,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Item, {
    label: "Total amount",
    value: `${row.totalAmount} ${row.currency || 'USD'}`
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Current payment",
    value: `${row.currentPayment} ${row.currency || 'USD'}`
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Balance amount",
    value: `${row.balanceAmount} ${row.currency || 'USD'}`
  }), /*#__PURE__*/React.createElement(Item, {
    label: "Remarks",
    value: row.remarks || '—'
  })))), tab === 'allocations' && /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: '14px 20px 18px',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("legend", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#0e0e0e',
      padding: '0 8px'
    }
  }, "Charge allocations"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px',
      background: '#EAF6FF',
      padding: '8px 12px',
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("div", null, "#"), /*#__PURE__*/React.createElement("div", null, "Charge head"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Invoiced"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, "Allocated")), (row.allocations || [{
    id: 1,
    head: 'Ocean freight',
    invoiced: '8,950.00',
    allocated: '8,950.00'
  }, {
    id: 2,
    head: 'BAF surcharge',
    invoiced: '2,200.00',
    allocated: '2,200.00'
  }, {
    id: 3,
    head: 'Terminal handling',
    invoiced: '1,390.00',
    allocated: '1,390.00'
  }]).map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '40px 1fr 160px 160px',
      padding: '8px 12px',
      fontSize: 12,
      borderTop: '1px solid rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", null, i + 1), /*#__PURE__*/React.createElement("div", null, a.head), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, a.invoiced), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums'
    }
  }, a.allocated))))), tab === 'ledger' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: 24,
      textAlign: 'center',
      color: '#717171'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/empty-box.png",
    alt: "Empty",
    style: {
      width: 100,
      opacity: 0.7
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 8
    }
  }, "Ledger postings will appear here after the receipt is approved.")), tab === 'audit' && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      border: '1px solid #d1d5db',
      borderRadius: 8,
      padding: 18,
      fontSize: 12,
      color: '#333'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid #f3f4f6'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      background: '#1cbb8c',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: '#0e0e0e'
    }
  }, "Receipt created"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#717680',
      fontSize: 11
    }
  }, "System \xB7 ", row.receiptDate))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid #f3f4f6'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 4,
      background: '#0a91ff',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: '#0e0e0e'
    }
  }, "Allocations posted"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#717680',
      fontSize: 11
    }
  }, "Divya Loganathan \xB7 ", row.receiptDate))))));
}
Object.assign(window, {
  ReceiptWizardPage,
  ReceiptDetailsPage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/ReceiptWizard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/nova/components.jsx
try { (() => {
/* eslint-disable no-undef */
/* ============================================================
   Nova UI Kit — icons (Tabler-style) + low-level primitives
   ============================================================ */

const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment
} = React;

/* ---------- Tabler-style icons ---------- */
function makeIcon(paths, viewBox = '0 0 24 24') {
  return function Icon({
    size = 16,
    stroke = 1.5,
    color = 'currentColor',
    className = '',
    style = {}
  }) {
    return /*#__PURE__*/React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: viewBox,
      fill: "none",
      stroke: color,
      strokeWidth: stroke,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: className,
      style: style
    }, paths);
  };
}
const IconMenu = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 6l16 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 12l16 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 18l16 0"
})));
const IconHome = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l-2 0l9 -9l9 9l-2 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"
})));
const IconHomeFill = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12.707 2.293a1 1 0 0 0 -1.414 0l-9 9a1 1 0 0 0 .707 1.707h1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-7h1a1 1 0 0 0 .707 -1.707l-9 -9z",
  fill: "currentColor",
  stroke: "none"
})));
const IconSearch = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M21 21l-6 -6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 17a7 7 0 1 0 0 -14a7 7 0 0 0 0 14z"
})));
const IconBell = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 17v1a3 3 0 0 0 6 0v-1"
})));
const IconUser = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"
})));
const IconWorld = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.6 9h16.8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.6 15h16.8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11.5 3a17 17 0 0 0 0 18"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12.5 3a17 17 0 0 1 0 18"
})));
const IconMaximize = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 8v-2a2 2 0 0 1 2 -2h2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 16v2a2 2 0 0 0 2 2h2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 4h2a2 2 0 0 1 2 2v2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 20h2a2 2 0 0 0 2 -2v-2"
})));
const IconGrid = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 4h6v6h-6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 4h6v6h-6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 14h6v6h-6z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 14h6v6h-6z"
})));
const IconX = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M18 6l-12 12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12"
})));
const IconChevDown = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M6 9l6 6l6 -6"
})));
const IconChevRight = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 6l6 6l-6 6"
})));
const IconChevLeft = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M15 6l-6 6l6 6"
})));
const IconArrowLeft = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l14 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12l6 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12l6 -6"
})));
const IconArrowUp = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 5l0 14"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 11l-6 -6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 11l6 -6"
})));
const IconArrowDown = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 5l0 14"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 13l-6 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 13l6 6"
})));
const IconPlus = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 5l0 14"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12l14 0"
})));
const IconList = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 6l11 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12l11 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 18l11 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 6l0 .01"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 12l0 .01"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 18l0 .01"
})));
const IconClock = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7v5l3 3"
})));
const IconShip = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 18l-1 -5h18l-2 4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 13v-6h8l4 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 7v-4h-1"
})));
const IconAnchor = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 9v12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 9a3 3 0 1 1 6 0a3 3 0 0 1 -6 0z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 12a8 8 0 0 0 5 5m-16 0a8 8 0 0 0 5 -5"
})));
const IconReceipt = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 7l6 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 11l6 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 15l4 0"
})));
const IconFile = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M14 3v4a1 1 0 0 0 1 1h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"
})));
const IconFiles = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M15 3v4a1 1 0 0 0 1 1h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2"
})));
const IconBuilding = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 21l18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 8l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 16l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 8l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 12l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 16l1 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16"
})));
const IconTruck = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"
})));
const IconContainer = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 6h16v12h-16z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 6v12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 6v12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 6v12"
})));
const IconCash = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 6m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
})));
const IconReport = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12l2 2l4 -4"
})));
const IconSettings = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"
})));
const IconFilter = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z"
})));
const IconPrint = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z"
})));
const IconTrash = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 7l16 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 11l0 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 11l0 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"
})));
const IconPencil = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13.5 6.5l4 4"
})));
const IconEye = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"
})));
const IconCheck = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M5 12l5 5l10 -10"
})));
const IconAlertCircle = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 8v4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 16h.01"
})));
const IconInfoCircle = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 9h.01"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11 12h1v4h1"
})));
const IconCheckCircle = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12l2 2l4 -4"
})));
const IconExternal = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11 13l9 -9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 4h5v5"
})));
const IconDownload = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 11l5 5l5 -5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 4l0 12"
})));
const IconRefresh = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
})));
const IconCopy = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"
})));
const IconLogout = makeIcon(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12h12l-3 -3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18 15l3 -3"
})));

/* ---------- SButton ---------- */
function SButton({
  text,
  children,
  variant = 'contained',
  color = 'primary',
  className = '',
  primary = true,
  disabled = false,
  onClick,
  type = 'button'
}) {
  const isPrimaryCTA = (className || '').includes('sm-primary-button') || primary && variant === 'contained' && color === 'primary';
  const cls = `btn ${isPrimaryCTA ? 'sm-primary-button' : ''} ${className || ''}`.trim();
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: cls,
    disabled: disabled,
    onClick: onClick
  }, text ?? children);
}

/* ---------- SLabel ---------- */
function SLabel({
  text,
  required = false,
  title,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `sm-field-label ${className || ''}`,
    title: title
  }, text, required && /*#__PURE__*/React.createElement("span", {
    className: "sm-required-asterisk"
  }, "*"));
}

/* ---------- SInput ---------- */
function SInput({
  name,
  value,
  onChange,
  placeholder,
  ctype,
  label,
  required,
  maxLength,
  disabled,
  invalid,
  endAdornment,
  type = 'text',
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `field ${className || ''}`
  }, label && /*#__PURE__*/React.createElement(SLabel, {
    text: label,
    required: required
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", {
    name: name,
    type: type,
    value: value ?? '',
    onChange: e => onChange && onChange(e),
    placeholder: placeholder,
    maxLength: maxLength,
    disabled: disabled,
    className: `sm-input-form-control ${invalid ? 'invalid' : ''}`,
    style: endAdornment ? {
      paddingRight: 30
    } : {}
  }), endAdornment && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 8,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#717171',
      pointerEvents: 'none',
      fontSize: 12
    }
  }, endAdornment)));
}

/* ---------- SCombo (select) ---------- */
function SCombo({
  name,
  value,
  onChange,
  options = [],
  label,
  required,
  placeholder,
  disabled,
  disableBlank = false,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `field ${className || ''}`
  }, label && /*#__PURE__*/React.createElement(SLabel, {
    text: label,
    required: required
  }), /*#__PURE__*/React.createElement("select", {
    name: name,
    value: value ?? '',
    onChange: onChange,
    disabled: disabled,
    className: "sm-select-combo"
  }, !disableBlank && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder || ''), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.id,
    value: o.id
  }, o.title))));
}

/* ---------- SCheckBox ---------- */
function SCheckBox({
  name,
  label,
  value,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 12,
      color: '#333'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    name: name,
    checked: !!value,
    disabled: disabled,
    onChange: e => onChange && onChange({
      target: {
        name,
        value: e.target.checked
      }
    }),
    style: {
      accentColor: '#0a91ff',
      width: 14,
      height: 14
    }
  }), label);
}

/* ---------- SBasicSearch ---------- */
function SBasicSearch({
  name,
  value,
  onChange,
  placeholder = 'Search',
  fullWidth = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sm-basic-search",
    style: {
      width: fullWidth ? '100%' : 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "search-icon"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    size: 16,
    color: "#717171"
  })), /*#__PURE__*/React.createElement("input", {
    name: name,
    value: value || '',
    onChange: onChange,
    placeholder: placeholder
  }));
}

/* ---------- SFilterChip ---------- */
function SFilterChip({
  label,
  selected,
  onClick,
  icon
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `sm-filter-chip ${selected ? 'selected' : ''}`,
    onClick: onClick
  }, icon, label);
}

/* ---------- Status chip ---------- */
function StatusChip({
  status
}) {
  const map = {
    'On time': 'on-time',
    'Delayed': 'delayed',
    'Pending': 'pending',
    'In transit': 'in-transit',
    'Posted': 'posted',
    'Draft': 'draft',
    'Cancelled': 'cancelled',
    'Partial': 'partial'
  };
  const cls = map[status] || 'draft';
  return /*#__PURE__*/React.createElement("span", {
    className: `chip ${cls}`
  }, status);
}

/* ---------- SMainCard ---------- */
function SMainCard({
  children,
  className = '',
  contentClass = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `sm-maincard ${className || ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `sm-nova-content ${contentClass || ''}`
  }, children));
}

/* ---------- SVersionPannel footer ---------- */
function SVersionPanel({
  version = '1.0',
  createUser = 'System',
  updateUser = 'System',
  cDate = new Date().toLocaleDateString(),
  uDate,
  tz = 'UTC'
}) {
  const [open, setOpen] = useState(true);
  return /*#__PURE__*/React.createElement("div", {
    className: "sm-version-panel",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "collapse",
    onClick: () => setOpen(o => !o),
    title: open ? 'Collapse' : 'Expand'
  }, open ? /*#__PURE__*/React.createElement(IconChevLeft, {
    size: 14
  }) : /*#__PURE__*/React.createElement(IconChevRight, {
    size: 14
  })), open && /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 35%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Created by ", /*#__PURE__*/React.createElement("strong", null, createUser), " \xB7 Created on ", /*#__PURE__*/React.createElement("strong", null, cDate, " ", tz)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 35%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Updated by ", /*#__PURE__*/React.createElement("strong", null, updateUser), " \xB7 Updated on ", /*#__PURE__*/React.createElement("strong", null, uDate || cDate, " ", tz)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sm-version-title"
  }, "Version : ", /*#__PURE__*/React.createElement("strong", null, version)))));
}

/* ---------- WizardHeader ---------- */
function WizardHeader({
  title,
  onBack,
  rightContent,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `wizard-header ${className || ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "left"
  }, onBack && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "back-circle",
    onClick: onBack,
    title: "Back"
  }, /*#__PURE__*/React.createElement(IconChevLeft, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    className: "wizard-title"
  }, title)), rightContent && /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, rightContent));
}

/* ---------- WizardFooter ---------- */
function WizardFooter({
  onBack,
  onNext,
  onCancel,
  backLabel = 'Back',
  nextLabel = 'Next',
  rightContent,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0 6px',
      borderTop: '1px solid #f3f4f6',
      flexShrink: 0,
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, onBack && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    style: {
      background: 'transparent',
      border: 'none',
      color: '#666',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px'
    }
  }, /*#__PURE__*/React.createElement(IconChevLeft, {
    size: 14
  }), " ", backLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, rightContent, onCancel && /*#__PURE__*/React.createElement(SButton, {
    text: "Cancel",
    primary: false,
    onClick: onCancel
  }), onNext && /*#__PURE__*/React.createElement(SButton, {
    text: nextLabel,
    disabled: disabled,
    onClick: onNext
  })));
}

/* ---------- SDialog ---------- */
function SDialog({
  open,
  onClose,
  title,
  children,
  actions,
  position = 'center',
  showCloseIcon = true,
  width
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: `sm-dialog-backdrop ${position === 'right' ? 'right-positioned' : ''}`,
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `sm-dialog ${position}`,
    style: width ? {
      width
    } : {},
    onClick: e => e.stopPropagation()
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "sm-msg-dialog-title"
  }, /*#__PURE__*/React.createElement("span", null, title), showCloseIcon && /*#__PURE__*/React.createElement("button", {
    className: "sm-dialog-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sm-msg-dialog-content"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "sm-msg-dialog-actions"
  }, actions)));
}

/* ---------- SConfirmationDialog ---------- */
function SConfirmationDialog({
  state,
  setState
}) {
  if (!state || !state.isOpen) return null;
  const tone = state.dialogTone || 'primary';
  const confirmCls = state.confirmVariant === 'delete' ? 'sm-confirm-btn delete' : 'sm-confirm-btn ok';
  const iconBg = tone === 'danger' ? '#fef2f2' : '#eef6ff';
  const iconColor = tone === 'danger' ? '#d32f2f' : '#1976d2';
  const Icon = tone === 'danger' ? IconAlertCircle : IconInfoCircle;
  const close = () => setState && setState({
    ...state,
    isOpen: false
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "sm-dialog-backdrop",
    onClick: close
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm-dialog",
    style: {
      width: 460
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 22px 12px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, !state.hideHeaderIcon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9999,
      background: iconBg,
      color: iconColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 22,
    stroke: 2
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: '#0e0e0e'
    }
  }, state.title), state.subTitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#717171'
    }
  }, state.subTitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px',
      fontSize: 12,
      color: '#333',
      lineHeight: 1.55
    }
  }, state.message), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 22px',
      borderTop: '1px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "sm-confirm-btn cancel",
    onClick: close
  }, state.cancelLabel || 'Cancel'), /*#__PURE__*/React.createElement("button", {
    className: confirmCls,
    onClick: () => {
      if (state.onConfirm) state.onConfirm();
      close();
    }
  }, state.confirmLabel || (state.confirmVariant === 'delete' ? 'Delete' : 'OK')))));
}

/* ---------- SMessage (toasts) ---------- */
function SMessage({
  notify,
  setNotify
}) {
  useEffect(() => {
    if (notify?.isOpen) {
      const dur = notify.duration ?? 6000;
      const t = setTimeout(() => setNotify && setNotify({
        ...notify,
        isOpen: false
      }), dur);
      return () => clearTimeout(t);
    }
  }, [notify?.isOpen]);
  if (!notify?.isOpen) return null;
  const map = {
    success: {
      Icon: IconCheckCircle,
      glyph: '✓'
    },
    error: {
      Icon: IconAlertCircle,
      glyph: '!'
    },
    warning: {
      Icon: IconAlertCircle,
      glyph: '!'
    },
    info: {
      Icon: IconInfoCircle,
      glyph: 'i'
    }
  };
  const {
    glyph
  } = map[notify.type] || map.info;
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: `toast ${notify.type || 'info'}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "toast-icon"
  }, glyph), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, notify.header && /*#__PURE__*/React.createElement("div", {
    className: "toast-header"
  }, notify.header), /*#__PURE__*/React.createElement("div", {
    className: "toast-body"
  }, notify.message)), /*#__PURE__*/React.createElement("button", {
    className: "toast-close",
    onClick: () => setNotify && setNotify({
      ...notify,
      isOpen: false
    })
  }, "\xD7")));
}

/* ---------- Export to window ---------- */
Object.assign(window, {
  IconMenu,
  IconHome,
  IconHomeFill,
  IconSearch,
  IconBell,
  IconUser,
  IconWorld,
  IconMaximize,
  IconGrid,
  IconX,
  IconChevDown,
  IconChevRight,
  IconChevLeft,
  IconArrowLeft,
  IconArrowUp,
  IconArrowDown,
  IconPlus,
  IconList,
  IconClock,
  IconShip,
  IconAnchor,
  IconReceipt,
  IconFile,
  IconFiles,
  IconBuilding,
  IconTruck,
  IconContainer,
  IconCash,
  IconReport,
  IconSettings,
  IconFilter,
  IconPrint,
  IconTrash,
  IconPencil,
  IconEye,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconCheckCircle,
  IconExternal,
  IconDownload,
  IconRefresh,
  IconCopy,
  IconLogout,
  SButton,
  SLabel,
  SInput,
  SCombo,
  SCheckBox,
  SBasicSearch,
  SFilterChip,
  StatusChip,
  SMainCard,
  SVersionPanel,
  WizardHeader,
  WizardFooter,
  SDialog,
  SConfirmationDialog,
  SMessage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/nova/components.jsx", error: String((e && e.message) || e) }); }

})();
