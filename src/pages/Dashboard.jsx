import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = useNavigate();

  // ✅ 1) Persist user session and set authChecked AFTER Firebase reports state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // ✅ 2) Redirect only after authChecked (prevents premature redirect)
  useEffect(() => {
    if (!authChecked) return;
    if (!user) navigate("/login");
  }, [authChecked, user, navigate]);

  // ✅ 3) Real-time listeners for owned + shared docs
  useEffect(() => {
    if (!user) return;

    const docsRef = collection(db, "documents");

    const ownedQ = query(docsRef, where("ownerId", "==", user.uid));
    const sharedQ = query(
      docsRef,
      where("collaborators", "array-contains", user.email)
    );

    const unsubOwned = onSnapshot(
      ownedQ,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() || {};
          if (!Array.isArray(data.collaborators)) data.collaborators = [];
          return { id: d.id, ...data };
        });

        list.sort((a, b) => {
          const ta =
            a.updatedAt?.toDate?.() ??
            a.updatedAt ??
            a.createdAt?.toDate?.() ??
            0;
          const tb =
            b.updatedAt?.toDate?.() ??
            b.updatedAt ??
            b.createdAt?.toDate?.() ??
            0;
          return tb - ta;
        });

        setOwnedDocs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Owned docs snapshot error:", err);
        setLoading(false);
      }
    );

    const unsubShared = onSnapshot(
      sharedQ,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() || {};
          if (!Array.isArray(data.collaborators)) data.collaborators = [];
          return { id: d.id, ...data };
        });

        list.sort((a, b) => {
          const ta =
            a.updatedAt?.toDate?.() ??
            a.updatedAt ??
            a.createdAt?.toDate?.() ??
            0;
          const tb =
            b.updatedAt?.toDate?.() ??
            b.updatedAt ??
            b.createdAt?.toDate?.() ??
            0;
          return tb - ta;
        });

        setSharedDocs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Shared docs snapshot error:", err);
        setLoading(false);
      }
    );

    return () => {
      try {
        unsubOwned();
      } catch (e) {}
      try {
        unsubShared();
      } catch (e) {}
    };
  }, [user]);

  // ✅ 4) Create new document
  const createDocument = async () => {
    if (!user) return alert("Please log in to create a document");

    const payload = {
      title: title.trim() || "Untitled Document",
      content: "",
      ownerId: user.uid,
      collaborators: [],
      createdAt: serverTimestamp(),
      updatedAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(db, "documents"), payload);

      setOwnedDocs((prev) => [
        { id: docRef.id, ...payload, createdAt: new Date() },
        ...prev,
      ]);
      setTitle("");
    } catch (err) {
      console.error("Error creating document:", err);
      alert("Failed to create document.");
    }
  };

  // ✅ 5) Delete document
  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "documents", id));
      setOwnedDocs((prev) => prev.filter((d) => d.id !== id));
      setSharedDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  // ✅ 6) Render documents with delete button
  const renderDocs = (docs, label, allowDelete = false) => (
    <>
      <h5 className="mt-4 mb-2 text-uppercase text-secondary fw-bold">
        {label}
      </h5>
      {docs.length === 0 ? (
        <div className="text-muted small ms-2">No documents available.</div>
      ) : (
        <div className="list-group shadow-sm rounded-3 mb-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <Link
                to={`/editor/${d.id}`}
                className="text-decoration-none flex-grow-1 me-3"
              >
                <div>
                  <div className="fw-bold">{d.title || "Untitled"}</div>
                  <div className="text-muted small">
                    {d.content
                      ? d.content.slice(0, 60) + "..."
                      : "No content yet"}
                  </div>
                </div>
              </Link>

              <div className="d-flex align-items-center gap-2">
                <small className="text-muted me-2">
                  {d.updatedAt?.toDate
                    ? new Date(d.updatedAt.toDate()).toLocaleString()
                    : d.createdAt?.toDate
                    ? new Date(d.createdAt.toDate()).toLocaleString()
                    : typeof d.updatedAt === "number"
                    ? new Date(d.updatedAt).toLocaleString()
                    : typeof d.createdAt === "number"
                    ? new Date(d.createdAt).toLocaleString()
                    : "No time"}
                </small>

                {allowDelete && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.id, d.title || "Untitled")}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ✅ 7) Render UI
  if (!authChecked) {
    return (
      <div className="text-center py-5 text-muted">
        Initializing authentication...
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h3 className="mb-3 mb-md-0">Dashboard</h3>
        <div className="d-flex w-100 w-md-auto">
          <input
            className="form-control me-2"
            placeholder="New document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-primary" onClick={createDocument}>
            + New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted py-5">Loading documents...</div>
      ) : (
        <>
          {renderDocs(ownedDocs, "My Documents", true)}
          {renderDocs(sharedDocs, "Shared with Me", false)}
        </>
      )}
    </div>
  );
}
