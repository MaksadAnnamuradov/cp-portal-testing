<template>
 <v-menu
      top
      origin="center center"
      :close-on-content-click='false'
      :offset-x='isOffsetX'
      :offset-y='isOffsetY'
      :open-on-hover='isOpenOnClick'
      :transition='transition'
      :value="openMenu"
      v-model="menuOpened"
      open-delay="300"
      close-delay="500"
      content-class="overflow-visible contain-none"
    >
     <template
        v-slot:activator="{ on }"
      >
        <v-btn v-if='icon' small  fab  light  v-on="on" :style="{ 'color': Sublib.getColor('header') }">
          <v-icon>{{ icon }}</v-icon>
        </v-btn>

        <v-list-item
          v-else-if='isSubMenu'
          class='d-flex justify-space-between'
          v-on="on"
        >
          {{ name }}

          <div class="flex-grow-1"></div>
          <v-icon> mdi-chevron-right</v-icon>
        </v-list-item>

        <v-btn v-else small  fab  light  :color='color' @click="openMenu=true" text v-on="on">
          {{ name }}
        </v-btn>

      </template>


      <v-list>
        <template
          v-for="(item, index) in menuItems"
        >
          <v-divider :key='index' v-if='item.isDivider'/>

          <menu-3
            v-else-if='item.menu && !openMenu'
            :isOffsetX="true" 
            :isOffsetY='false'
            :isOpenOnClick='true'
            :isSubMenu='true'
            :key='item.name'
            :menu-items='item.menu'
            :name='item.name'
            @sub-menu-click='emitClickEvent'
          />

          <v-list-item
            v-else
            :key='item.icon'
            @click='emitClickEvent(item)'
            @mouseover='openMenu = !openMenu'
          >
            <v-list-item-action v-if="item.icon">
              <v-icon medium>{{item.icon}}</v-icon>
            </v-list-item-action>

            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>

          </v-list-item>

        </template>
      </v-list>
    </v-menu>
</template>

<script>

export default {
  name: 'Menu',
  components: {
    Menu3: () => import('./MenuWIthHover.vue')
  },

  created(){
     this.$emit('close-prev-menu');
  },

  props: {
    name: String,
    icon: String,
    menuItems: Array,
    color: { type: String},
    isOffsetX: { type: Boolean, default: false },
    isOffsetY: { type: Boolean, default: true },
    isSubMenu: { type: Boolean, default: false },
    transition: { type: String, default: "scale-transition" }
  },
 methods: {
    emitClickEvent(item) {
      this.$emit("sub-menu-click", item);
      this.openMenu = false;
      this.menuOpened = false;
      return true;
    },
  },
  watch: {
    menuOpened: function () {
      console.log("menuOpened", this.menuOpened)
      this.isOpenOnClick = !this.menuOpened;
    }
  },
  data: () => ({
    openMenu: false,
    isOpenOnClick: true,
    menuOpened: false
  })

}
</script>