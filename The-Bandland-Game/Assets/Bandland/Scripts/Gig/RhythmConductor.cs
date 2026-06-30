using System;
using UnityEngine;

namespace Bandland.Gig
{
    public enum BeatRating { Miss, Good, Perfect }

    public class RhythmConductor : MonoBehaviour
    {
        [SerializeField] AudioSource beatTickSource;

        public event Action<int> OnBeat;
        public event Action<BeatRating, int> OnHitRated;
        public event Action<int> OnComboChanged;
        public event Action OnCheerTriggered;

        int _bpm = 120;
        int _beatIndex;
        int _combo;
        int _bestCombo;
        float _secondsPerBeat;
        float _nextBeatTime;
        float _songStart;
        bool _running;
        int _cheerThreshold = 5;

        public int Combo => _combo;
        public int BestCombo => _bestCombo;
        public int BeatIndex => _beatIndex;
        public float SecondsPerBeat => _secondsPerBeat;
        public bool IsRunning => _running;

        public void Configure(int bpm, int cheerThreshold)
        {
            _bpm = Mathf.Max(60, bpm);
            _cheerThreshold = cheerThreshold;
            _secondsPerBeat = 60f / _bpm;
        }

        public void StartRhythm()
        {
            _beatIndex = 0;
            _combo = 0;
            _bestCombo = 0;
            _songStart = Time.time;
            _nextBeatTime = _songStart + _secondsPerBeat;
            _running = true;
        }

        public void StopRhythm() => _running = false;

        void Update()
        {
            if (!_running) return;

            while (Time.time >= _nextBeatTime)
            {
                _beatIndex++;
                OnBeat?.Invoke(_beatIndex);
                if (beatTickSource != null)
                    beatTickSource.PlayOneShot(beatTickSource.clip, 0.15f);
                _nextBeatTime += _secondsPerBeat;
            }
        }

        public BeatRating TryHit()
        {
            if (!_running) return BeatRating.Miss;
            return ApplyRating(RateCurrentBeat());
        }

        public void RegisterMiss()
        {
            if (!_running) return;
            ApplyRating(BeatRating.Miss);
        }

        BeatRating RateCurrentBeat()
        {
            float elapsed = Time.time - _songStart;
            float beatPhase = elapsed % _secondsPerBeat;
            float dist = Mathf.Min(beatPhase, _secondsPerBeat - beatPhase);

            var config = GameState.Instance?.Config;
            float perfect = config != null ? config.perfectWindow : 0.12f;
            float good = config != null ? config.goodWindow : 0.22f;

            if (dist <= perfect) return BeatRating.Perfect;
            if (dist <= good) return BeatRating.Good;
            return BeatRating.Miss;
        }

        BeatRating ApplyRating(BeatRating rating)
        {
            if (rating == BeatRating.Miss)
                _combo = 0;
            else
            {
                _combo++;
                _bestCombo = Mathf.Max(_bestCombo, _combo);
                if (_combo >= _cheerThreshold && _combo % _cheerThreshold == 0)
                    OnCheerTriggered?.Invoke();
            }

            OnHitRated?.Invoke(rating, _combo);
            OnComboChanged?.Invoke(_combo);
            return rating;
        }

        public float GetBeatPulse()
        {
            if (!_running) return 0f;
            float phase = (Time.time - _songStart) % _secondsPerBeat / _secondsPerBeat;
            return 1f - Mathf.Abs(phase - 0.5f) * 2f;
        }
    }
}
