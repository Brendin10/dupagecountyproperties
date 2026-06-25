using System;
using System.Collections.Generic;
using UnityEngine;

namespace Bandland
{
    public enum CharacterId { Benny, Lizzy }

    [Serializable]
    public class VenueDefinition
    {
        public string id;
        public string displayName;
        public int starRequired;
        public float tipMultiplier;
        public int crowdCap;
        public int bpm;
    }

    [CreateAssetMenu(fileName = "BandlandConfig", menuName = "Bandland/Config")]
    public class BandlandConfig : ScriptableObject
    {
        public List<VenueDefinition> venues = new()
        {
            new() { id = "street-corner", displayName = "Street Corner", starRequired = 0, tipMultiplier = 1f, crowdCap = 12, bpm = 100 },
            new() { id = "local-tavern", displayName = "Local Tavern", starRequired = 25, tipMultiplier = 2f, crowdCap = 24, bpm = 110 },
            new() { id = "town-square", displayName = "Town Square", starRequired = 60, tipMultiplier = 3.5f, crowdCap = 40, bpm = 115 },
            new() { id = "talent-show", displayName = "Local Talent Show", starRequired = 100, tipMultiplier = 5f, crowdCap = 60, bpm = 120 },
            new() { id = "concert-venue", displayName = "Small Concert Venue", starRequired = 160, tipMultiplier = 8f, crowdCap = 90, bpm = 128 },
        };

        public int cheerComboThreshold = 5;
        public float gigDurationSeconds = 45f;
        public float perfectWindow = 0.12f;
        public float goodWindow = 0.22f;
    }

    public class GameState : MonoBehaviour
    {
        public static GameState Instance { get; private set; }

        public CharacterId SelectedCharacter { get; set; } = CharacterId.Benny;
        public float BandCash { get; set; }
        public float StarMeter { get; set; }
        public string CurrentVenueId { get; set; } = "street-corner";
        public bool HasTrashLid { get; set; }
        public BandlandConfig Config { get; private set; }

        void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Config = Resources.Load<BandlandConfig>("BandlandConfig");
            if (Config == null)
            {
                Config = ScriptableObject.CreateInstance<BandlandConfig>();
            }
        }

        public VenueDefinition GetCurrentVenue()
        {
            return Config.venues.Find(v => v.id == CurrentVenueId) ?? Config.venues[0];
        }

        public bool IsVenueUnlocked(VenueDefinition venue) => StarMeter >= venue.starRequired;
    }
}
