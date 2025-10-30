import { useState, useRef, useEffect } from "react";
import { Note } from "../types/job";
import "./NotesSection.css";

interface NotesSectionProps {
  candidateId: string;
  notes: Note[];
  onAddNote: (text: string, mentions: string[]) => void;
}

const TEAM_MEMBERS = [
  { id: "1", name: "Alice Johnson", role: "Recruiter" },
  { id: "2", name: "Bob Smith", role: "Hiring Manager" },
  { id: "3", name: "Carol Davis", role: "Tech Lead" },
  { id: "4", name: "David Wilson", role: "HR Manager" },
  { id: "5", name: "Emma Brown", role: "Senior Developer" },
  { id: "6", name: "Frank Miller", role: "CTO" },
  { id: "7", name: "Grace Lee", role: "Product Manager" },
  { id: "8", name: "Henry Taylor", role: "Engineering Manager" },
];

export default function NotesSection({
  candidateId,
  notes = [],
  onAddNote,
}: NotesSectionProps) {
  const [noteText, setNoteText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [filteredMembers, setFilteredMembers] = useState(TEAM_MEMBERS);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lastAtIndex = noteText.lastIndexOf("@", cursorPosition);

    if (lastAtIndex !== -1 && lastAtIndex < cursorPosition) {
      const textAfterAt = noteText.substring(lastAtIndex + 1, cursorPosition);
      if (textAfterAt.includes(" ")) {
        setShowMentions(false);
        return;
      }
      setMentionSearch(textAfterAt);
      setShowMentions(true);

      const filtered = TEAM_MEMBERS.filter((member) =>
        member.name.toLowerCase().includes(textAfterAt.toLowerCase()),
      );
      setFilteredMembers(filtered);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  }, [noteText, cursorPosition]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMembers[selectedMentionIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    }
  };

  const insertMention = (member: (typeof TEAM_MEMBERS)[0]) => {
    const lastAtIndex = noteText.lastIndexOf("@", cursorPosition);
    const beforeMention = noteText.substring(0, lastAtIndex);
    const afterMention = noteText.substring(cursorPosition);

    const newText = `${beforeMention}@${member.name} ${afterMention}`;
    setNoteText(newText);
    setShowMentions(false);

    const newCursorPos = lastAtIndex + member.name.length + 2;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([A-Za-z]+\s[A-Za-z]+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const mentions = extractMentions(noteText);
    onAddNote(noteText, mentions);
    setNoteText("");
    setCursorPosition(0);
  };

  const renderNoteText = (text: string) => {
    const parts = text.split(/(@[A-Za-z]+\s[A-Za-z]+)/g);
    return parts.map((part, index) =>
      part.startsWith("@") ? (
        <span key={index} className="mention-highlight">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  return (
    <div className="notes-section">
      <h4 className="notes-header">Notes ({notes.length})</h4>

      <form onSubmit={handleSubmit} className="note-form">
        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={noteText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            placeholder="Add a note... (Use @ to mention team members)"
            rows={3}
            className="note-textarea"
          />

          {showMentions && filteredMembers.length > 0 && (
            <div ref={mentionMenuRef} className="mentions-dropdown">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className={`mentions-item ${
                    index === selectedMentionIndex ? "active" : ""
                  }`}
                  onMouseEnter={() => setSelectedMentionIndex(index)}
                >
                  <div className="mentions-item-name">@{member.name}</div>
                  <div className="mentions-item-role">{member.role}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="note-tip-container">
          <div className="note-tip">💡 Tip: Type @ to mention team members</div>
          <button
            type="submit"
            disabled={!noteText.trim()}
            className="add-note-btn"
          >
            Add Note
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className="notes-empty">
          No notes yet. Add your first note above.
        </div>
      ) : (
        <div className="notes-list">
          {notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <div className="note-author">{note.createdBy}</div>
                <div className="note-date">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="note-body">{renderNoteText(note.text)}</div>

              {note.mentions.length > 0 && (
                <div className="note-mentions">
                  <span className="note-mentions-label">Mentioned:</span>
                  {note.mentions.map((mention, idx) => (
                    <span key={idx} className="note-mention-pill">
                      @{mention}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
