using UnityEngine;
using UnityEngine.SceneManagement;

namespace Bandland
{
    public class SceneNavigator : MonoBehaviour
    {
        public const string CharacterSelect = "CharacterSelect";
        public const string Hub = "Hub";
        public const string Gig = "Gig";

        public static void LoadCharacterSelect() => SceneManager.LoadScene(CharacterSelect);
        public static void LoadHub() => SceneManager.LoadScene(Hub);
        public static void LoadGig() => SceneManager.LoadScene(Gig);
    }
}
