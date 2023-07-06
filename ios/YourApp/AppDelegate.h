#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

#import "Adjust.h"
#import "AdjustBridge.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

@end
