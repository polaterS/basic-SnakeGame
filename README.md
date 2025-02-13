# Modern Snake Game

Modern ve çok oyunculu bir yılan oyunu uygulaması. WebRTC teknolojisi kullanılarak peer-to-peer bağlantı ile arkadaşlarınızla oynayabilirsiniz.

[![Hemen Oyna](https://img.shields.io/badge/HEMEN%20OYNA-brightgreen?style=for-the-badge)](https://polaterS.github.io/basic-SnakeGame/)

## Özellikler

- 🎮 Tek oyunculu mod
- 👥 Çok oyunculu mod (WebRTC ile P2P bağlantı)
- 🌓 Karanlık/Aydınlık tema desteği
- 💾 Kullanıcı adı kaydetme
- 🔗 Link paylaşımı ile kolay katılım
- 📱 Mobil uyumlu tasarım

## Nasıl Oynanır?

1. Oyunu açtığınızda kullanıcı adınızı girin (en az 3 karakter)
2. Ana menüden oyun modunu seçin:
   - Tek Oyunculu: Normal yılan oyunu
   - Arkadaşınla Oyna: Çok oyunculu mod

### Tek Oyunculu Mod

- Yılanınızı ok tuşları veya WASD ile kontrol edin
- Yemi yiyerek büyüyün ve puan kazanın
- Duvarlara veya kendinize çarpmamaya dikkat edin

### Çok Oyunculu Mod

1. "Arkadaşınla Oyna" seçeneğine tıklayın
2. "Oda Oluştur" butonuna basın
3. Size verilen oda kodunu veya linki arkadaşınızla paylaşın
4. Arkadaşınız linke tıkladığında otomatik olarak oyuna katılacaktır

## Kontroller

- Ok tuşları veya WASD: Yılanı yönlendirme
- 🌙/☀️ butonu: Tema değiştirme
- ESC: Oyundan çıkış

## Teknik Detaylar

- HTML5 Canvas ile oyun render'lama
- WebRTC (PeerJS) ile P2P bağlantı
- LocalStorage ile kullanıcı verilerini saklama
- CSS Variables ile tema desteği
- Responsive tasarım

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/polaterS/basic-SnakeGame.git
   ```

2. Proje dizinine gidin:
   ```bash
   cd basic-SnakeGame
   ```

3. Bir web sunucusu ile çalıştırın (örneğin Python ile):
   ```bash
   python -m http.server 8000
   ```

4. Tarayıcınızda açın:
   ```
   http://localhost:8000
   ```

## Geliştirme

Projeyi geliştirmek için:

1. Kaynak kodları `js/` dizininde bulabilirsiniz
2. Her bir bileşen kendi dosyasında modüler olarak yazılmıştır
3. Oyun ayarlarını `js/config.js` dosyasından değiştirebilirsiniz

## Lisans

MIT License - Dilediğiniz gibi kullanabilirsiniz. 