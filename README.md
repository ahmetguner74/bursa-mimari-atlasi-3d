# Bursa Mimari Atlası 3B

Bursa Atatürk Caddesi ve Orhan Meydanı çevresindeki yapıları özgün 3B yorumlarla inceleyen statik web uygulaması. İş Bankası ile Kent Hotel ortak sahnede bitişik konumlanır; Osmanlı Bankası / İttihat ve Terakki Kulübü aynı kayıp yapının farklı dönemleridir. Ulu Cami ve Mecidiye Çinili Çeşme ayrı model sayfasındadır.

**Atlas:** https://ahmetguner74.github.io/bursa-mimari-atlasi-3d/birlikte.html

`docs/` doğrudan GitHub Pages'ten yayımlanır. Yerelde denemek için bu klasörde `python -m http.server 8000 -d docs` çalıştırıp `http://localhost:8000/birlikte.html` adresini açın. ES module ve model veri dosyaları nedeniyle sayfalar dosya sisteminden doğrudan açılmamalıdır.

Modeller DGN oturum verileri, fotoğraf karşılaştırmaları ve kaynaklarda açıkça belirtilen görsel yorumlarla oluşturuldu; rölöve veya güncel saha ölçümü değildir. Yapı bazındaki **Kaynaklar** pencereleri ve JSON kayıtları dayanakları ve belirsizlikleri açıklar. Özgün DGN dosyaları ile yeniden dağıtım izni doğrulanmamış kullanıcı fotoğrafları bu depoda yoktur. İş Bankası sayfasında gösterilen iki Wikimedia Commons fotoğrafının atıf ve lisansları [medya kaydında](docs/media/ATTRIBUTION.md) bulunur. `vendor/` altındaki Three.js bileşenleri kendi MIT lisanslarıyla gelir.

Hayvanat bahçesi modeli ayrı [projede](https://github.com/ahmetguner74/bursa-hayvanat-bahcesi-3d) sürdürülür.
