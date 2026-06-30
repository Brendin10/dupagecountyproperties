using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace Bandland
{
    public class HubUI : MonoBehaviour
    {
        [SerializeField] TextMeshProUGUI cashLabel;
        [SerializeField] TextMeshProUGUI starLabel;
        [SerializeField] TextMeshProUGUI venueLabel;
        [SerializeField] Button playGigButton;
        [SerializeField] Button prevVenueButton;
        [SerializeField] Button nextVenueButton;
        [SerializeField] Image characterPreview;

        int _venueIndex;

        void Start()
        {
            if (GameState.Instance == null)
                new GameObject("GameState").AddComponent<GameState>();

            var gs = GameState.Instance;
            _venueIndex = gs.Config.venues.FindIndex(v => v.id == gs.CurrentVenueId);
            if (_venueIndex < 0) _venueIndex = 0;

            playGigButton?.onClick.AddListener(() => SceneNavigator.LoadGig());
            prevVenueButton?.onClick.AddListener(() => ChangeVenue(-1));
            nextVenueButton?.onClick.AddListener(() => ChangeVenue(1));

            string charName = gs.SelectedCharacter == CharacterId.Lizzy ? "lizzy" : "benny";
            var sprite = Resources.Load<Sprite>($"Sprites/{charName}");
            if (characterPreview != null && sprite != null) characterPreview.sprite = sprite;

            Refresh();
        }

        void ChangeVenue(int dir)
        {
            var venues = GameState.Instance.Config.venues;
            int next = Mathf.Clamp(_venueIndex + dir, 0, venues.Count - 1);
            if (!GameState.Instance.IsVenueUnlocked(venues[next])) return;
            _venueIndex = next;
            GameState.Instance.CurrentVenueId = venues[next].id;
            Refresh();
        }

        void Refresh()
        {
            var gs = GameState.Instance;
            var venue = gs.Config.venues[_venueIndex];
            if (cashLabel != null) cashLabel.text = $"BandCash: ${gs.BandCash:0}";
            if (starLabel != null) starLabel.text = $"Star Meter: {gs.StarMeter:0}";
            if (venueLabel != null)
            {
                bool unlocked = gs.IsVenueUnlocked(venue);
                venueLabel.text = unlocked
                    ? $"{venue.displayName}  •  {venue.bpm} BPM"
                    : $"{venue.displayName}  🔒  ({venue.starRequired} ★)";
            }
            if (playGigButton != null)
                playGigButton.interactable = gs.IsVenueUnlocked(venue);
        }
    }
}
