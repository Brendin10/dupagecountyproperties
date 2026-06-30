using UnityEngine;

namespace Bandland.Gig
{
    /// <summary>
    /// Crowd murmur loop — volume rises with on-beat streak, drops on misses.
    /// </summary>
    public class CrowdAudioController : MonoBehaviour
    {
        [SerializeField] AudioSource crowdSource;
        [SerializeField] float minVolume = 0.06f;
        [SerializeField] float maxVolume = 0.9f;
        [SerializeField] float riseSpeed = 2.5f;
        [SerializeField] float fallSpeed = 4f;

        float _targetVolume;
        int _combo;

        void Awake()
        {
            if (crowdSource != null)
            {
                crowdSource.loop = true;
                crowdSource.volume = minVolume;
                if (crowdSource.clip != null && !crowdSource.isPlaying)
                    crowdSource.Play();
            }
            _targetVolume = minVolume;
        }

        public void Begin()
        {
            if (crowdSource != null && crowdSource.clip != null && !crowdSource.isPlaying)
            {
                crowdSource.volume = minVolume;
                crowdSource.Play();
            }
        }

        public void SetCombo(int combo)
        {
            _combo = combo;
            _targetVolume = Mathf.Lerp(minVolume, maxVolume, Mathf.Clamp01(combo / 18f));
        }

        public void OnMiss()
        {
            _combo = 0;
            _targetVolume = minVolume;
            if (crowdSource != null)
                crowdSource.volume = Mathf.Max(minVolume, crowdSource.volume * 0.55f);
        }

        public void OnHit(BeatRating rating)
        {
            float boost = rating == BeatRating.Perfect ? 0.08f : 0.04f;
            _targetVolume = Mathf.Min(maxVolume, _targetVolume + boost);
        }

        void Update()
        {
            if (crowdSource == null) return;
            float speed = crowdSource.volume < _targetVolume ? riseSpeed : fallSpeed;
            crowdSource.volume = Mathf.MoveTowards(crowdSource.volume, _targetVolume, speed * Time.deltaTime);
        }

        public void Stop()
        {
            if (crowdSource != null)
                crowdSource.Stop();
        }
    }
}
