import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { ZhTwMapComponent } from '../components/zh-tw-map/zh-tw-map.component';

@Component({
  selector: 'app-historical-review',
  imports: [HeaderComponent, ZhTwMapComponent],
  template: `
    <app-header />

    <div class="grid grid-cols-1 xl:grid-cols-[500px,1fr]">
      <div class="relative bg-[#E4FAFF]">
        <app-zh-tw-map class="top:auto static block h-[148px] xl:sticky xl:top-[65px] xl:h-[calc(100dvh-65px)]" />
      </div>

      <div>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, corrupti? Quia non a vel nostrum quos illum
        aut quaerat architecto necessitatibus, sed, porro perferendis incidunt, harum at suscipit dolor ratione.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas ratione placeat perferendis eaque reprehenderit
        architecto, qui necessitatibus perspiciatis suscipit, distinctio sit voluptatibus praesentium et. Ad cum
        reprehenderit assumenda cumque esse.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae nihil illo fugit quidem libero, expedita
        accusantium labore neque sunt asperiores, praesentium illum qui nostrum voluptatibus consectetur repellat natus
        perferendis? Ut.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur architecto eum voluptas rerum? Eveniet
        rerum distinctio quos necessitatibus, nam, eum deleniti odit odio animi expedita sed, quod hic delectus totam.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vero dignissimos sint quisquam velit tempora nisi fuga
        aperiam ratione voluptatum libero in qui magnam unde officia ea, ipsam iure quod animi.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime earum dicta quae ut a perspiciatis tenetur
        asperiores distinctio consectetur, dolores reprehenderit cumque possimus maiores animi quis, voluptates, magnam
        saepe vero?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis non aperiam eveniet animi iste quia ipsa ab
        quae! Quis saepe non animi optio quaerat assumenda facere exercitationem quae, dolorum maiores?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequuntur amet, nisi officiis maxime quo non enim
        voluptatum quas adipisci at id laboriosam, placeat optio necessitatibus a quaerat ducimus quis odit.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto minus soluta cumque eaque reiciendis modi eum
        molestiae atque harum! Illum veritatis voluptatum consectetur aut, nesciunt non vitae ut blanditiis mollitia.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, placeat delectus, veritatis exercitationem
        voluptate quo nostrum itaque dolore sequi odio quibusdam quidem officia aliquam! Distinctio similique eum
        voluptatum nulla porro?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis! Assumenda dolor debitis vero rerum
        ad sint id vel repellat sapiente laboriosam voluptate corrupti saepe facilis deleniti, dignissimos, velit
        laborum.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum dolores quos optio nam. Nostrum debitis
        distinctio sapiente quod magnam molestiae ratione doloremque reiciendis hic repellat eligendi, sit, voluptatum
        illo explicabo?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ea, atque provident nesciunt id, quaerat, eveniet
        harum incidunt sed mollitia dolor repellendus eos commodi vitae vel praesentium nemo sint iusto similique?
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi, perspiciatis fugit dolorem ea inventore minima
        illo, ratione laudantium mollitia natus similique omnis iste, cumque eum eveniet error porro numquam cum.
        <br />
        <hr />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia nemo fugit, veritatis reprehenderit sequi est
        at, reiciendis vero voluptatum rerum laudantium in, eos ratione quis voluptas doloribus ab. Mollitia, ipsum!
        <br />
        <hr />
        <br />
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab minima eum, aliquam mollitia unde provident
        eligendi et nostrum accusamus dignissimos voluptatibus repellendus? Totam ex blanditiis maiores adipisci magnam
        quod officia?
      </div>
    </div>
  `,
  styles: ``,
})
export class HistoricalReviewComponent {}
