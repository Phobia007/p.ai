import {d as defineComponent,V as h,z as computed,h as useApp,k as useRoute,v as Button} from './B5B1E9Dr.js';
import {a as SmoothScroll,_ as ScrollIndicator} from './BRCWKBTb.js';
import {u as useMetadata,A as BackArrow} from './B2Em7_D3.js';
import {pillarDetails} from './pillars-data.js';

export default defineComponent({
  name:'PillarDetail',
  setup(){
    const app=useApp(),route=useRoute();
    const pillar=computed(()=>pillarDetails.find(detail=>detail.slug.current===route.params.slug));
    useMetadata();
    return()=>h('div',{class:'pillar-detail'},[
      h(SmoothScroll,null,{default:()=>h('article',{
        class:['page','pillar-detail-page',{'page-visible':app.pageReady}],
        'aria-labelledby':'pillar-title'
      },[
        h('div',{class:'pillar-detail__content','data-pillar':pillar.value?.slug.current??''},[
          h('h1',{id:'pillar-title',class:'pillar-detail__title'},pillar.value?.title??'Pillar not found'),
          h('p',{class:'pillar-detail__lead'},pillar.value?.lead??'This pillar is not available.'),
          ...(pillar.value?.paragraphs??[]).map((paragraph,index)=>h('p',{key:index,class:'pillar-detail__paragraph'},paragraph))
        ]),
        h(Button,{text:'To overview',to:'/',class:'pillar-detail__back','icon-placement':'left','icon-hover':'',sound:'to-overview'},{default:()=>h(BackArrow)}),
        h(ScrollIndicator)
      ])})
    ]);
  }
});
