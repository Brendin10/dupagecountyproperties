using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Bandland.Gig
{
    public class CrowdController : MonoBehaviour
    {
        [SerializeField] Transform crowdRoot;
        [SerializeField] float spacing = 0.55f;
        [SerializeField] float cheerBounceHeight = 0.15f;
        [SerializeField] float cheerDuration = 0.4f;

        readonly List<Transform> _members = new();
        readonly List<Sprite> _sprites = new();
        SpriteRenderer _srPrefab;

        void Awake()
        {
            for (int i = 0; i < 5; i++)
            {
                var tex = Resources.Load<Sprite>($"Sprites/crowd_back_{i}");
                if (tex != null) _sprites.Add(tex);
            }
            if (_sprites.Count == 0)
            {
                var all = Resources.LoadAll<Sprite>("Sprites");
                foreach (var s in all)
                    if (s.name.StartsWith("crowd_back")) _sprites.Add(s);
            }
        }

        public void SetCrowdSize(int count)
        {
            count = Mathf.Clamp(count, 0, 30);
            while (_members.Count < count) AddMember();
            while (_members.Count > count)
            {
                var last = _members[_members.Count - 1];
                _members.RemoveAt(_members.Count - 1);
                if (last != null) Destroy(last.gameObject);
            }
            LayoutCrowd();
        }

        void AddMember()
        {
            var go = new GameObject($"Crowd_{_members.Count}");
            go.transform.SetParent(crowdRoot != null ? crowdRoot : transform);
            var sr = go.AddComponent<SpriteRenderer>();
            if (_sprites.Count > 0)
                sr.sprite = _sprites[Random.Range(0, _sprites.Count)];
            sr.sortingOrder = 5;
            _members.Add(go.transform);
        }

        void LayoutCrowd()
        {
            int n = _members.Count;
            float totalWidth = (n - 1) * spacing;
            float startX = -totalWidth * 0.5f;
            for (int i = 0; i < n; i++)
            {
                var t = _members[i];
                t.localPosition = new Vector3(startX + i * spacing, 0f, 0f);
                t.localScale = Vector3.one * Random.Range(0.85f, 1.1f);
            }
        }

        public void PlayCheerAnimation()
        {
            StopAllCoroutines();
            StartCoroutine(CheerRoutine());
        }

        IEnumerator CheerRoutine()
        {
            var origins = new Vector3[_members.Count];
            for (int i = 0; i < _members.Count; i++)
                origins[i] = _members[i].localPosition;

            float t = 0f;
            while (t < cheerDuration)
            {
                t += Time.deltaTime;
                float wave = Mathf.Sin(t / cheerDuration * Mathf.PI) * cheerBounceHeight;
                for (int i = 0; i < _members.Count; i++)
                {
                    var p = origins[i];
                    p.y += wave * (1f + Mathf.Sin(i * 0.8f) * 0.2f);
                    _members[i].localPosition = p;
                }
                yield return null;
            }
            LayoutCrowd();
        }
    }
}
