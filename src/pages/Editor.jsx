import React from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { debounce } from "../utils/debounce";

export default function Editor() {
  const { id } = useParams();
  const [content, setContent] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // Collaboration states
  const [collabEmail, setCollabEmail] = React.useState("");
  const [shareMsg, setShareMsg] = React.useState("");

  React.useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "documents", id);

    // Load document initially
    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setContent(data.content || "");
        }
      })
      .catch((err) => console.error("Error loading document:", err))
      .finally(() => setLoading(false));

    // Real-time updates for collaboration
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();

        setTitle((prev) => (data.title !== prev ? data.title : prev));
        setContent((prev) => (data.content !== prev ? data.content : prev));
      },
      (error) => {
        console.error("Snapshot listener error:", error);
      }
    );

    return () => unsub();
  }, [id]);

  // Debounced content save
  const saveContent = React.useMemo(
    () =>
      debounce(async (newContent) => {
        try {
          setStatus("Saving...");
          const docRef = doc(db, "documents", id);
          await updateDoc(docRef, {
            content: newContent,
            updatedAt: Date.now(),
          });
          setStatus("Saved");
          setTimeout(() => setStatus(""), 1000);
        } catch (error) {
          console.error("Error saving content:", error);
          setStatus("Error saving");
        }
      }, 600),
    [id]
  );

  // Debounced title save
  const saveTitle = React.useMemo(
    () =>
      debounce(async (newTitle) => {
        try {
          const docRef = doc(db, "documents", id);
          await updateDoc(docRef, { title: newTitle, updatedAt: Date.now() });
        } catch (error) {
          console.error("Error saving title:", error);
        }
      }, 800),
    [id]
  );

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    saveContent(value);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    saveTitle(value);
  };

  // ✅ Share document by collaborator email (store email directly)
  const handleAddCollaborator = async () => {
    try {
      const email = collabEmail.trim();
      if (!email) return setShareMsg("Please enter an email");

      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, {
        collaborators: arrayUnion(email),
      });

      setShareMsg(`Document shared with ${email}`);
      setCollabEmail("");
      setTimeout(() => setShareMsg(""), 3000);
    } catch (err) {
      console.error("Error sharing document:", err);
      setShareMsg("Error sharing document");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading document...</div>;
  }

  return (
    <div className="container-fluid p-3" style={{ height: "90vh" }}>
      {/* Title */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          value={title}
          onChange={handleTitleChange}
          placeholder="Document title"
        />
        <small className="text-muted">{status}</small>
      </div>

      {/* Share Collaborator Section */}
      <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
        <input
          type="email"
          className="form-control"
          placeholder="Add collaborator by email"
          value={collabEmail}
          onChange={(e) => setCollabEmail(e.target.value)}
        />
        <button
          className="btn btn-outline-primary"
          onClick={handleAddCollaborator}
        >
          Share
        </button>
      </div>
      {shareMsg && <small className="text-success">{shareMsg}</small>}

      {/* Content Editor */}
      <textarea
        className="form-control"
        style={{
          height: "70vh",
          resize: "none",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
          fontSize: "16px",
          lineHeight: "1.6",
        }}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
      />
    </div>
  );
}
