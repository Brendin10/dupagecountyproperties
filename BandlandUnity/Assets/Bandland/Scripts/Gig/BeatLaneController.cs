using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland.Gig
{
    /// <summary>
    /// Scrolling beat lane — notes travel toward the hit line.
    /// Passing notes without a hit trigger a miss (star penalty + quieter crowd).
    /// </summary>
    public class BeatLaneController : MonoBehaviour
    {
        [SerializeField] RectTransform laneRect;
        [SerializeField] RectTransform notesParent;
        [SerializeField] RectTransform hitLine;
        [SerializeField] Image notePrefab;
        [SerializeField] RhythmConductor rhythm;
        [SerializeField] float travelBeats = 2f;
        [SerializeField] float hitLineAnchorX = 0.22f;

        readonly List<BeatNote> _notes = new();

        public event Action OnLaneMiss;

        float _laneWidth;
        float _hitLineX;
        bool _active;

        public void Configure(RhythmConductor conductor) => rhythm = conductor;

        public void Begin()
        {
            _active = true;
            ClearNotes();
            if (rhythm != null)
                rhythm.OnBeat += SpawnNoteForBeat;
            RecalculateGeometry();
        }

        public void Stop()
        {
            _active = false;
            if (rhythm != null)
                rhythm.OnBeat -= SpawnNoteForBeat;
            ClearNotes();
        }

        void Update()
        {
            if (!_active || rhythm == null || !rhythm.IsRunning) return;

            float speed = _laneWidth / (travelBeats * rhythm.SecondsPerBeat);
            float perfect = GameState.Instance?.Config.perfectWindow ?? 0.12f;
            float good = GameState.Instance?.Config.goodWindow ?? 0.22f;
            float missEdge = _hitLineX + speed * good * 1.2f;

            for (int i = _notes.Count - 1; i >= 0; i--)
            {
                var note = _notes[i];
                note.X -= speed * Time.deltaTime;
                note.Rect.anchoredPosition = new Vector2(note.X, 0f);

                if (!note.Consumed && note.X < missEdge)
                {
                    note.Consumed = true;
                    rhythm?.RegisterMiss();
                    OnLaneMiss?.Invoke();
                    Destroy(note.Rect.gameObject);
                    _notes.RemoveAt(i);
                }
            }
        }

        public BeatRating TryHit()
        {
            if (!_active || rhythm == null) return BeatRating.Miss;

            var rating = rhythm.TryHit();
            float perfect = GameState.Instance?.Config.perfectWindow ?? 0.12f;
            float good = GameState.Instance?.Config.goodWindow ?? 0.22f;
            float window = speedWindow(good);

            BeatNote closest = null;
            float closestDist = float.MaxValue;
            foreach (var note in _notes)
            {
                if (note.Consumed) continue;
                float dist = Mathf.Abs(note.X - _hitLineX);
                if (dist < window && dist < closestDist)
                {
                    closest = note;
                    closestDist = dist;
                }
            }

            if (rating != BeatRating.Miss && closest != null)
            {
                closest.Consumed = true;
                Destroy(closest.Rect.gameObject);
                _notes.Remove(closest);
                HighlightHitLine(rating);
            }
            else if (rating == BeatRating.Miss && closest != null)
            {
                closest.Consumed = true;
                Destroy(closest.Rect.gameObject);
                _notes.Remove(closest);
            }

            return rating;
        }

        float speedWindow(float good)
        {
            if (rhythm == null) return 40f;
            float speed = _laneWidth / (travelBeats * rhythm.SecondsPerBeat);
            return speed * good * 1.5f;
        }

        void SpawnNoteForBeat(int beatIndex)
        {
            if (notePrefab == null || notesParent == null) return;

            var img = Instantiate(notePrefab, notesParent);
            img.gameObject.SetActive(true);
            var rt = img.rectTransform;
            rt.anchoredPosition = new Vector2(_laneWidth * 0.5f, 0f);

            _notes.Add(new BeatNote { Rect = rt, X = _laneWidth * 0.5f });
        }

        void HighlightHitLine(BeatRating rating)
        {
            if (hitLine == null) return;
            var img = hitLine.GetComponent<Image>();
            if (img == null) return;
            img.color = rating == BeatRating.Perfect
                ? new Color(1f, 0.85f, 0.3f, 0.95f)
                : new Color(0.4f, 0.95f, 0.6f, 0.9f);
        }

        void RecalculateGeometry()
        {
            if (laneRect == null) return;
            _laneWidth = laneRect.rect.width;
            _hitLineX = -_laneWidth * 0.5f + _laneWidth * hitLineAnchorX;
            if (hitLine != null)
                hitLine.anchoredPosition = new Vector2(_hitLineX, 0f);
        }

        void ClearNotes()
        {
            foreach (var n in _notes)
                if (n.Rect != null) Destroy(n.Rect.gameObject);
            _notes.Clear();
        }

        void OnRectTransformDimensionsChange() => RecalculateGeometry();

        class BeatNote
        {
            public RectTransform Rect;
            public float X;
            public bool Consumed;
        }
    }
}
