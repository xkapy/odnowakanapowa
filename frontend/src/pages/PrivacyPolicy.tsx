export default function PrivacyPolicy() {
  return (
    <div className="pt-50 pb-30 max-w-5xl mx-auto p-6 text-gray-800">
      <h1 className="text-4xl font-bold mb-8">Polityka Prywatności</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Postanowienia ogólne</h2>
        <p>Niniejsza Polityka Prywatności dotyczy strony internetowej, która ma charakter statyczny i nie umożliwia logowania ani tworzenia kont użytkownika.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Administrator danych</h2>
        <p>Administratorem danych jest właściciel strony: Odnowa Kanapowa, kontakt: odnowakanapowa@gmail.com.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Jakie dane są zbierane</h2>
        <p>Strona może zbierać dane techniczne dotyczące Twojej wizyty, takie jak:</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>adres IP,</li>
          <li>typ przeglądarki,</li>
          <li>czas spędzony na stronie,</li>
          <li>pliki cookies (ciasteczka).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Cel przetwarzania danych</h2>
        <p>Dane zbierane automatycznie wykorzystywane są wyłącznie do celów statystycznych, technicznych i ulepszania działania strony.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Podstawa prawna</h2>
        <p>Przetwarzanie danych odbywa się zgodnie z:</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>art. 6 ust. 1 lit. f RODO – uzasadniony interes administratora,</li>
          <li>art. 47 i 51 Konstytucji RP.</li>
        </ul>
        <div className="bg-gray-100 p-4 rounded-[4px] mt-4">
          <blockquote className="text-sm italic text-gray-700">
            „Przetwarzanie danych osobowych jest dopuszczalne, jeżeli jest niezbędne do celów wynikających z prawnie uzasadnionych interesów realizowanych przez administratora.”
          </blockquote>
          <p className="text-right text-xs mt-2 text-gray-500">– RODO, art. 6 ust. 1 lit. f</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-[4px] mt-4">
          <blockquote className="text-sm italic text-gray-700">
            „Każdy ma prawo do ochrony prawnej życia prywatnego, rodzinnego, czci i dobrego imienia oraz do decydowania o swoim życiu osobistym.”
          </blockquote>
          <p className="text-right text-xs mt-2 text-gray-500">– Konstytucja Rzeczypospolitej Polskiej, art. 47</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-[4px] mt-4">
          <blockquote className="text-sm italic text-gray-700">„Nikt nie może być obowiązany inaczej niż na podstawie ustawy do ujawniania informacji dotyczących jego osoby.”</blockquote>
          <p className="text-right text-xs mt-2 text-gray-500">– Konstytucja Rzeczypospolitej Polskiej, art. 51 ust. 1</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Pliki cookies</h2>
        <p>Strona korzysta z plików cookies w celu poprawnego działania oraz analizy ruchu. Możesz zarządzać cookies w ustawieniach swojej przeglądarki.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Twoje prawa</h2>
        <p>Masz prawo do:</p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>dostępu do danych,</li>
          <li>żądania ich usunięcia,</li>
          <li>ograniczenia przetwarzania,</li>
          <li>złożenia skargi do PUODO.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Zmiany w polityce prywatności</h2>
        <p>Polityka prywatności może być aktualizowana. Aktualna wersja zawsze będzie dostępna pod tym samym adresem URL.</p>
      </section>
    </div>
  );
}
