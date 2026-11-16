import type {Place} from '../places.ts';
/** Destination-only art direction. Rock and cloud pigments remain the original values. */
export const PLACE_COLORS:Record<Place,Readonly<Record<number,string>>>={
 centralpark:{1:'#72AE64',2:'#E5D5B4',3:'#D6CCB4',5:'#765440',6:'#246F48',7:'#328C91',11:'#F4B2C8',12:'#A69581',14:'#FFF1D2',15:'#315C44',17:'#9DCAC3'},
 coney:{1:'#3E7958',2:'#D7CCB4',3:'#596A7C',4:'#F18D5A',5:'#634F43',6:'#235B48',7:'#52798B',8:'#162539',9:'#FFF0CB',11:'#EF976D',12:'#32445F',14:'#F1DBB2',16:'#EC7850',17:'#749DAF'},
 highline:{1:'#B9A66D',2:'#D4C5A7',3:'#C3B7A6',4:'#D99243',5:'#76583E',6:'#CF7A3B',7:'#427D9D',8:'#263F46',11:'#DBB85E',12:'#B76046',13:'#527F83',14:'#E9D6B7',17:'#92C5CE'},
 rockefeller:{1:'#DCE9ED',2:'#E5E0D7',3:'#CBCFD8',4:'#CBA75B',5:'#665449',6:'#476B5C',7:'#7CBBCF',8:'#243C5F',9:'#FFE0A0',11:'#D95663',12:'#694C65',14:'#F4EAE0',15:'#166C58',16:'#BC384D',17:'#A4DCE9',18:'#F2F7FA',19:'#E1B44C'},
 kyoto:{1:'#9FA77A',2:'#D2C3B7',3:'#C8B6A9',4:'#CC896F',5:'#715547',6:'#B6BA8A',7:'#718F9A',8:'#343849',9:'#FFDAA4',11:'#EF8FAE',12:'#8D6258',14:'#F3DFC8',16:'#A44250',17:'#A5B5B9'},
 okinawa:{1:'#ECD8A0',2:'#FFF0CA',3:'#E6CEAA',4:'#FFAA58',5:'#A9774A',6:'#268B71',7:'#1DBABF',8:'#1F5361',9:'#FFF3D8',11:'#FF8D98',12:'#C97857',14:'#FFF3D9',15:'#39786A',16:'#F17C58',17:'#B6EFE7',19:'#FFCE61'},
 nikko:{1:'#A79362',2:'#CCBBA5',3:'#C5D3CE',4:'#D79654',5:'#654E46',6:'#BF4935',7:'#4D9BAA',8:'#343D4A',9:'#FFDEA0',11:'#EB9950',12:'#954A3D',14:'#E9DBB9',15:'#315B4D',16:'#AD343C',17:'#9AD9DC',19:'#CCA452'},
 hokkaido:{1:'#DBE9F0',2:'#C6D8E4',3:'#BCCEDC',4:'#E5AF63',5:'#775747',6:'#8CA9B5',7:'#78BDD3',8:'#29485C',9:'#FFD396',11:'#C8957D',12:'#9F6255',14:'#E6E6DD',15:'#326F75',16:'#E07D53',17:'#B3D6E5',18:'#F5FCFF'},
 canalmarket:{1:'#709C75',2:'#B3BE9D',3:'#DFD2A7',4:'#E8AD4D',5:'#805A42',6:'#236A53',7:'#3C968F',8:'#244844',9:'#FFDE95',11:'#F0BC4D',12:'#AD6856',14:'#EDDAB3',15:'#38795B',16:'#D86548',17:'#83BAB3'},
 krabi:{1:'#DACA93',2:'#EEDDB0',3:'#D5CAA8',4:'#EB9B54',5:'#95694C',6:'#28764F',7:'#27B7AE',8:'#2B5A58',9:'#FFE4B4',11:'#F5B67E',12:'#BA836A',14:'#F5E8C4',15:'#3C8568',16:'#DB7649',17:'#92E4D4'},
 inthanon:{1:'#94A477',2:'#D6C3AA',3:'#E6DBCD',4:'#977FAF',5:'#796050',6:'#6F8B65',7:'#679DB0',8:'#444658',9:'#FFE3AA',11:'#DE8FC3',12:'#A48B9E',14:'#F0DFD3',15:'#657C70',16:'#B77B93',17:'#B6C4CF',19:'#D7B666'},
};
export function placePalette(variant:{place?:Place},base:Float32Array){
 if(!variant.place)return base;
 const palette=new Float32Array(base);
 for(const [index,hex]of Object.entries(PLACE_COLORS[variant.place]))palette.set(hex.slice(1).match(/../g)!.map(value=>Math.pow(parseInt(value,16)/255,2.2)),Number(index)*3);
 return palette;
}
