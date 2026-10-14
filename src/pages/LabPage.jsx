import React, { useState } from 'react';
import { PageHead } from '../components/common/PageHead';
import { LegacyStepper } from '../components/common/LegacyStepper';

const LAB_ITEMS = [
  { id: 'list-ins', cat: 'list', title: 'רשימה מקושרת — הכנסה ומחיקה' },
  { id: 'list-rev', cat: 'list', title: 'היפוך רשימה במקום (3 מצביעים)' },
  { id: 'stack-queue', cat: 'stq', title: 'מחסנית ותור מעגלי במערך' },
  { id: 'traversal', cat: 'tree', title: 'סריקות עץ (Inorder, Preorder, Postorder)' },
  { id: 'bst-ins', cat: 'tree', title: 'הכנסה לעץ חיפוש בינארי (BST)' },
  { id: 'bst-del', cat: 'tree', title: 'מחיקה מ-BST (שלושת המקרים ועוקב)' },
  { id: 'avl-ins', cat: 'tree', title: 'עץ AVL — הכנסה וגלגולים' },
  { id: 'heap-ops', cat: 'heap', title: 'ערימת מקסימום — Heapify ו-Extract-Max' },
  { id: 'build-heap', cat: 'heap', title: 'בניית ערימה Build-Heap ב-O(n)' },
  { id: 'partition', cat: 'sort', title: 'Quicksort — חלוקת Hoare Partition' },
  { id: 'counting', cat: 'sort', title: 'מיון מנייה (Counting Sort) ויציבות' },
  { id: 'hash', cat: 'hash', title: 'טבלת גיבוב — שרשור ומיעון פתוח' },
  { id: 'aug-size', cat: 'aug', title: 'עץ מועשר בגדלים (OS-Select ו-OS-Rank)' }
];

export function LabPage() {
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = [
    ['all', 'כל ההמחשות (13)'],
    ['tree', 'עצים (BST / AVL / סריקות)'],
    ['heap', 'ערימות'],
    ['sort', 'מיונים'],
    ['list', 'רשימות'],
    ['stq', 'מחסנית ותור'],
    ['hash', 'גיבוב'],
    ['aug', 'מבנים מועשרים']
  ];

  const filtered = selectedCat === 'all'
    ? LAB_ITEMS
    : LAB_ITEMS.filter(item => item.cat === selectedCat);

  return (
    <>
      <PageHead
        eyebrow="מעבדה אינטראקטיבית"
        title="לראות את המבנה משתנה"
        desc="הזן נתונים, בצע פעולה ועצור בכל שלב. ההדגמות מבוססות על מבנים הנלמדים בקורס."
      />

      <div className="tabs wrap">
        {categories.map(([cat, label]) => (
          <button
            key={cat}
            className={selectedCat === cat ? 'selected' : ''}
            onClick={() => setSelectedCat(cat)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="lab-grid">
        {filtered.map(item => (
          <section key={item.id} className="surface lesson-section" style={{ marginBottom: 28 }}>
            <h2 style={{ marginBottom: 12 }}>{item.title}</h2>
            <LegacyStepper id={item.id} />
          </section>
        ))}
      </div>
    </>
  );
}
