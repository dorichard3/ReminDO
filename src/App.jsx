import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarStyles.css'; // Custom calendar styles

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [date, setDate] = useState('');
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editHour, setEditHour] = useState('12');
  const [editMinute, setEditMinute] = useState('00');
  const [editAmpm, setEditAmpm] = useState('AM');
  const [editDate, setEditDate] = useState('');
  const [editRepeat, setEditRepeat] = useState(false);
  const [category, setCategory] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [agendaNotes, setAgendaNotes] = useState(() => localStorage.getItem('agendaNotes') || '');
  const [agendaTitle, setAgendaTitle] = useState('');
  const [savedAgendas, setSavedAgendas] = useState(() => {
    const saved = localStorage.getItem('savedAgendas');
    return saved ? JSON.parse(saved) : [];
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [folderName, setFolderName] = useState('');
  const [folderedAgendas, setFolderedAgendas] = useState(() => {
    const saved = localStorage.getItem('folderedAgendas');
    return saved ? JSON.parse(saved) : {};
  });

  const [openFolders, setOpenFolders] = useState({});

  useEffect(() => {
    localStorage.setItem('agendaNotes', agendaNotes);
  }, [agendaNotes]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('savedAgendas', JSON.stringify(savedAgendas));
  }, [savedAgendas]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('folderedAgendas', JSON.stringify(folderedAgendas));
  }, [folderedAgendas]);

  const addNote = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newNote = {
      id: Date.now(),
      text,
      time: `${hour}:${minute} ${ampm}`,
      date,
      category,
      repeat: repeatDaily,
      done: false
    };

    if (Notification.permission === 'granted' && date && hour && minute && ampm) {
      const now = new Date();
      const scheduledTime = new Date(`${date}T00:00`);
      let hour24 = parseInt(hour);
      if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm === 'AM' && hour24 === 12) hour24 = 0;
      scheduledTime.setHours(hour24);
      scheduledTime.setMinutes(parseInt(minute));
      scheduledTime.setSeconds(0);

      const delay = scheduledTime.getTime() - now.getTime();
      if (delay > 0) {
        const showNotification = () => new Notification(`🔔 Reminder: ${text}`);
        setTimeout(() => {
          showNotification();
          if (repeatDaily) {
            setInterval(showNotification, 24 * 60 * 60 * 1000);
          }
        }, delay);
      }
    }

    setNotes([newNote, ...notes]);
    setText('');
    setHour('12');
    setMinute('00');
    setAmpm('AM');
    setDate('');
    setCategory('');
  };

  const toggleDone = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, done: !n.done } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to delete all reminders?')) {
      setNotes([]);
    }
  };

  const saveAgenda = () => {
    if (!agendaTitle.trim() || !agendaNotes.trim() || !folderName.trim()) return;

    const now = new Date();
    const saved = {
      title: agendaTitle,
      content: agendaNotes,
      timestamp: now.toLocaleString()
    };

    const updatedFolders = { ...folderedAgendas };
    if (!updatedFolders[folderName]) {
      updatedFolders[folderName] = [];
    }
    updatedFolders[folderName].push(saved);

    setFolderedAgendas(updatedFolders);
    setAgendaTitle('');
    setAgendaNotes('');
    setFolderName('');
  };

  const deleteAgenda = (folderName, agendaTitle) => {
    const updatedFolders = { ...folderedAgendas };
    if (updatedFolders[folderName]) {
      updatedFolders[folderName] = updatedFolders[folderName].filter(
        (a) => a.title !== agendaTitle
      );
      if (updatedFolders[folderName].length === 0) {
        delete updatedFolders[folderName]; // Optional: delete empty folder
      }
      setFolderedAgendas(updatedFolders);
    }
  };

  const toggleFolder = (folder) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });

  return (
    <div>
      {/* Your app layout and logic here */}
    </div>
  );
}

export default App;
