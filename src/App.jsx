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

  const params = new URLSearchParams(window.location.search);
  const editIdFromUrl = params.get('editId');


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

  useEffect(() => {
    if (editIdFromUrl && !editId) {
      const existingNote = notes.find(n => n.id.toString() === editIdFromUrl);
      if (existingNote) {
        setEditId(existingNote.id);
        setEditText(existingNote.text);
        setEditHour(existingNote.time.split(':')[0]);
        setEditMinute(existingNote.time.split(':')[1].split(' ')[0]);
        setEditAmpm(existingNote.time.split(' ')[1]);
        setEditDate(existingNote.date);
        setEditCategory(existingNote.category);
        setEditRepeat(existingNote.repeat);
      }
    }
  }, [editIdFromUrl, notes]);


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
    setText(''); setHour('12'); setMinute('00'); setAmpm('AM'); setDate(''); setCategory('');
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
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', backgroundColor: '#fff8e1', color: '#222', minHeight: '100vh' }}>
      <h1 style={{ color: '#d35400' }}>📝 ReminDO ⏰</h1>
      <button onClick={() => setShowCalendar(!showCalendar)} style={{ marginBottom: '1rem', backgroundColor: '#f1c40f', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px' }}>
        📅 {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>

      <form onSubmit={addNote} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a reminder..." style={{ padding: '0.5rem', flexGrow: 1, backgroundColor: '#fffbe6', border: '1px solid #ccc', color: '#000' }} />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" style={{ padding: '0.5rem', backgroundColor: '#fffbe6', border: '1px solid #ccc', color: '#000' }} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '0.5rem', backgroundColor: '#fffbe6', border: '1px solid #ccc', color: '#000', fontFamily: 'Inter, sans-serif' }} />
        <select value={hour} onChange={(e) => setHour(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
        <select value={minute} onChange={(e) => setMinute(e.target.value)}>{Array.from({ length: 60 }, (_, i) => <option key={i}>{String(i).padStart(2, '0')}</option>)}</select>
        <select value={ampm} onChange={(e) => setAmpm(e.target.value)}><option>AM</option><option>PM</option></select>
        <label><input type="checkbox" checked={repeatDaily} onChange={(e) => setRepeatDaily(e.target.checked)} /> Repeat Daily</label>
        <button type="submit" style={{ backgroundColor: '#f39c12', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>Add</button>
        <button type="button" onClick={clearAll} style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '0.5rem 1rem' }}>Clear Everything</button>
      </form>

      {editId && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const updated = notes.map((note) =>
              note.id === editId
                ? {
                    ...note,
                    text: editText,
                    time: `${editHour}:${editMinute} ${editAmpm}`,
                    date: editDate,
                    category: editCategory,
                    repeat: editRepeat,
                  }
                : note
            );
            setNotes(updated);
            setEditId(null);
            setEditText('');
            setEditHour('12');
            setEditMinute('00');
            setEditAmpm('AM');
            setEditDate('');
            setEditCategory('');
            setEditRepeat(false);
          }}
          style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px' }}
        >
          <h3>Edit Reminder</h3>
          <input value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Reminder text" style={{ margin: '0.5rem' }} />
          <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" style={{ margin: '0.5rem' }} />
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} style={{ margin: '0.5rem' }} />
          <select value={editHour} onChange={(e) => setEditHour(e.target.value)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}</select>
          <select value={editMinute} onChange={(e) => setEditMinute(e.target.value)}>{Array.from({ length: 60 }, (_, i) => <option key={i}>{String(i).padStart(2, '0')}</option>)}</select>
          <select value={editAmpm} onChange={(e) => setEditAmpm(e.target.value)}><option>AM</option><option>PM</option></select>
          <label><input type="checkbox" checked={editRepeat} onChange={(e) => setEditRepeat(e.target.checked)} /> Repeat Daily</label>
          <button type="submit" style={{ marginLeft: '0.5rem', backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '0.25rem 0.75rem' }}>Save</button>
          <button onClick={() => setEditId(null)} style={{ marginLeft: '0.5rem', backgroundColor: '#ccc', padding: '0.25rem 0.75rem' }}>Cancel</button>
        </form>
      )}


      <ul>
        {sortedNotes.map((note) => (
          <li key={note.id}>
            <input type="checkbox" checked={note.done} onChange={() => toggleDone(note.id)} />
            <span style={{ textDecoration: note.done ? 'line-through' : 'none', cursor: 'pointer' }}>
              {note.text} {note.category && `— 🗂️ ${note.category}`} {note.date && `— 📅 ${note.date}`} {note.time && `— ⏰ ${note.time}`} {note.repeat && '🔁'}
            </span>
            <button onClick={() => deleteNote(note.id)} style={{ marginLeft: '0.5rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '0.25rem 0.75rem' }}>Delete</button>
            <button
              onClick={() => {
                setEditId(note.id);
                setEditText(note.text);
                setEditHour(note.time.split(':')[0]);
                setEditMinute(note.time.split(':')[1].split(' ')[0]);
                setEditAmpm(note.time.split(' ')[1]);
                setEditDate(note.date);
                setEditCategory(note.category);
                setEditRepeat(note.repeat);
              }}
              style={{ marginLeft: '0.5rem', backgroundColor: '#f39c12', color: '#fff', border: 'none', padding: '0.25rem 0.75rem' }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '2rem' }}>
        <h2>🗓️ Notes / Agenda</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <input
            value={agendaTitle}
            onChange={(e) => setAgendaTitle(e.target.value)}
            placeholder="Title for agenda note"
            style={{ flexGrow: 1, padding: '0.5rem', backgroundColor: '#fffbe6',border: '1px solid #ccc', color: '#000' }}
          />
          <input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name (e.g. 6/17 or Work)"
            style={{
              flexGrow: 1,
              padding: '0.5rem',
              backgroundColor: '#fffbe6',
              border: '1px solid #ccc',
              color: '#000'
            }}
          />
          <button
            onClick={saveAgenda}
            style={{ backgroundColor: '#f1c40f', color: '#000', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}
          >
            Save Agenda
          </button>
        </div>


        <textarea value={agendaNotes} onChange={(e) => setAgendaNotes(e.target.value)} rows={10} style={{ width: '100%', padding: '1rem', backgroundColor: '#fff8e1', color: '#222', border: '1px solid #ccc' }} placeholder="Write your daily plan or ideas here..." />

        <div style={{ marginTop: '2rem' }}>
          <h3>📁 Saved Agenda Folders</h3>
          const [openFolders, setOpenFolders] = useState({}); // keep track of expanded state
          {Object.keys(folderedAgendas).map(folder => (
            <div key={folder}>
              <h4 onClick={() =>
                setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }))
              }>
                {folder}
              </h4>
              {openFolders[folder] && (
                <ul>
                  {folderedAgendas[folder].map((agenda, idx) => (
                    <li key={idx}>
                      <strong>{agenda.title}</strong>
                      <button onClick={() => deleteAgenda(folder, agenda.title)}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}



        </div>

      </div>

      {showCalendar && (
        <div style={{ marginTop: '2rem' }}>
          <h2>📆 Calendar View</h2>
          <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={({ date }) => notes.some(n => n.date === date.toISOString().split('T')[0]) ? (<div className="dot"></div>) : null} />
          <h3>Reminders for {selectedDate.toDateString()}</h3>
          <ul>
            {sortedNotes.filter(note => note.date === selectedDate.toISOString().split('T')[0]).map(note => (
              <li key={note.id}>{note.text} — ⏰ {note.time} {note.repeat && '🔁'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
