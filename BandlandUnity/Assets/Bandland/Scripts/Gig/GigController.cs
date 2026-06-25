using System.Collections;
using Bandland.Gig;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland
{
    public class GigController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] GigCutscene cutscene;
        [SerializeField] RhythmConductor rhythm;
        [SerializeField] CrowdController crowd;
        [SerializeField] NightlifeAmbience ambience;
        [SerializeField] Transform performer;
        [SerializeField] SpriteRenderer performerRenderer;
        [SerializeField] Button playButton;
        [SerializeField] AudioSource sfxSource;
        [SerializeField] AudioClip cymbalClip;
        [SerializeField] AudioClip cheerClip;

        [Header("UI")]
        [SerializeField] TextMeshProUGUI cashText;
        [SerializeField] TextMeshProUGUI starText;
        [SerializeField] TextMeshProUGUI comboText;
        [SerializeField] TextMeshProUGUI ratingText;
        [SerializeField] TextMeshProUGUI timerText;
        [SerializeField] Slider crowdSlider;
        [SerializeField] Slider cheerSlider;
        [SerializeField] Image beatRing;
        [SerializeField] GameObject gameplayPanel;

        float _sessionCash;
        float _sessionStars;
        float _crowd = 3f;
        float _cheer;
        float _timeLeft;
        float _gigDuration;
        bool _gigActive;
        int _crowdCap = 12;
        float _tipMultiplier = 1f;
        int _appeal = 3;

        void Start()
        {
            var gs = GameState.Instance;
            if (gs == null)
            {
                var go = new GameObject("GameState");
                go.AddComponent<GameState>();
                gs = GameState.Instance;
            }

            var venue = gs.GetCurrentVenue();
            _crowdCap = venue.crowdCap;
            _tipMultiplier = venue.tipMultiplier;
            _gigDuration = gs.Config.gigDurationSeconds;
            _appeal = 3 + Mathf.FloorToInt(gs.StarMeter * 0.1f);

            rhythm.Configure(venue.bpm, gs.Config.cheerComboThreshold);
            rhythm.OnHitRated += OnHitRated;
            rhythm.OnComboChanged += OnComboChanged;
            rhythm.OnCheerTriggered += OnCheerTriggered;

            if (playButton != null)
            {
                playButton.onClick.AddListener(OnPlayTapped);
                playButton.interactable = false;
            }

            SetupPerformerSprite(gs.SelectedCharacter);
            if (gameplayPanel != null) gameplayPanel.SetActive(false);

            StartCoroutine(BeginGig(venue.displayName));
        }

        void SetupPerformerSprite(CharacterId id)
        {
            if (performerRenderer == null) return;
            string name = id == CharacterId.Lizzy ? "lizzy" : "benny";
            var sprite = Resources.Load<Sprite>($"Sprites/{name}");
            if (sprite != null) performerRenderer.sprite = sprite;
        }

        IEnumerator BeginGig(string venueName)
        {
            yield return cutscene.PlayIntro(venueName);
            if (gameplayPanel != null) gameplayPanel.SetActive(true);
            if (playButton != null) playButton.interactable = true;
            crowd.SetCrowdSize(Mathf.RoundToInt(_crowd));
            rhythm.StartRhythm();
            _timeLeft = _gigDuration;
            _gigActive = true;
        }

        void Update()
        {
            if (!_gigActive) return;

            _timeLeft -= Time.deltaTime;
            if (timerText != null) timerText.text = Mathf.CeilToInt(_timeLeft).ToString();

            if (beatRing != null && rhythm.IsRunning)
            {
                float pulse = rhythm.GetBeatPulse();
                beatRing.transform.localScale = Vector3.one * (1f + pulse * 0.15f);
                beatRing.color = Color.Lerp(new Color(1f, 0.4f, 0.6f, 0.4f), new Color(1f, 0.85f, 0.3f, 0.9f), pulse);
            }

            if (_timeLeft <= 0f) EndGig();

            RefreshHud();
        }

        void OnPlayTapped()
        {
            if (!_gigActive) return;
            var rating = rhythm.TryHit();

            if (rating != BeatRating.Miss)
            {
                if (sfxSource != null && cymbalClip != null)
                    sfxSource.PlayOneShot(cymbalClip);

                float crowdGain = rating == BeatRating.Perfect ? 0.8f : 0.4f;
                _crowd = Mathf.Min(_crowdCap, _crowd + crowdGain + _appeal * 0.02f);
                _cheer = Mathf.Min(100f, _cheer + (rating == BeatRating.Perfect ? 4f : 2f));

                float tip = (1f + _crowd * 0.12f) * _tipMultiplier * (rating == BeatRating.Perfect ? 1.5f : 1f);
                _sessionCash += tip;
                _sessionStars += 0.15f + _crowd * 0.02f;

                if (performer != null)
                    StartCoroutine(PerformerBounce());

                crowd.SetCrowdSize(Mathf.RoundToInt(_crowd));
            }

            if (ratingText != null)
            {
                ratingText.text = rating.ToString().ToUpper();
                ratingText.color = rating switch
                {
                    BeatRating.Perfect => new Color(1f, 0.85f, 0.3f),
                    BeatRating.Good => new Color(0.4f, 0.9f, 0.6f),
                    _ => new Color(1f, 0.4f, 0.4f),
                };
            }
        }

        IEnumerator PerformerBounce()
        {
            if (performer == null) yield break;
            var basePos = performer.localPosition;
            float t = 0f;
            while (t < 0.12f)
            {
                t += Time.deltaTime;
                performer.localPosition = basePos + Vector3.up * Mathf.Sin(t / 0.12f * Mathf.PI) * 0.08f;
                yield return null;
            }
            performer.localPosition = basePos;
        }

        void OnHitRated(BeatRating rating, int combo) { }

        void OnComboChanged(int combo)
        {
            if (comboText != null)
                comboText.text = combo > 0 ? $"COMBO x{combo}" : "";
        }

        void OnCheerTriggered()
        {
            if (sfxSource != null && cheerClip != null)
                sfxSource.PlayOneShot(cheerClip, 0.9f);
            crowd.PlayCheerAnimation();
            _cheer = Mathf.Min(100f, _cheer + 10f);
            if (ratingText != null)
            {
                ratingText.text = "CROWD CHEERS!";
                ratingText.color = new Color(1f, 0.85f, 0.3f);
            }
        }

        void RefreshHud()
        {
            if (cashText != null) cashText.text = $"${_sessionCash:0}";
            if (starText != null) starText.text = $"⭐ {_sessionStars:0.0}";
            if (crowdSlider != null) crowdSlider.value = _crowd / _crowdCap;
            if (cheerSlider != null) cheerSlider.value = _cheer / 100f;
        }

        void EndGig()
        {
            _gigActive = false;
            rhythm.StopRhythm();
            if (playButton != null) playButton.interactable = false;

            var gs = GameState.Instance;
            if (gs != null)
            {
                gs.BandCash += _sessionCash;
                gs.StarMeter += _sessionStars;
            }

            SceneNavigator.LoadHub();
        }

        void OnDestroy()
        {
            if (rhythm != null)
            {
                rhythm.OnHitRated -= OnHitRated;
                rhythm.OnComboChanged -= OnComboChanged;
                rhythm.OnCheerTriggered -= OnCheerTriggered;
            }
        }
    }
}
